import tornado.web
import tornado.escape

import time
from pymongo import Connection

class Handler(tornado.web.RequestHandler):
 	mconn = Connection('localhost', 27017)
	mdb = mconn['canopsis']
	mselectors = mdb['selectors']

	def get_mango_filter(self, selector_id):
	
		selector = self.mselectors.find_one({'_id': str(selector_id)})

		mfilter = selector['filter']
		collection = selector['collection']

		if mfilter == 'all':
			mfilter = {}

		return (collection, mfilter)


	def get_items_by_selector(self, selector_id, fields=[]):
	
		(collection, mfilter) = self.get_mango_filter(selector_id)

		mfields = {}
		for field in fields:
			mfields[field] = 1

		mcollection = self.mdb[collection]

		return mcollection.find(mfilter, mfields)

	def set_mango_cache(self, _id, data):
		mcache = self.mdb['cache']
		data={'timestamp': time.time(), 'data': data}
		mcache.update({'_id': _id}, {"$set": data}, upsert=True, safe=True)
		
	def get_mango_cache(self, _id, freshness=59):
		mcache = self.mdb['cache']
		record = mcache.find_one({'_id': _id, 'timestamp': {'$gt': time.time()-freshness} })
		if record:
			return record['data']
		else:
			return None
		

	def map_reduce_field(self, selector_id, field):
		cacheId = 'id-map_reduce-'+selector_id

		output = self.get_mango_cache(cacheId)
		
		if output:
			print "Get result from cache ..."
		else:
			(collection, mfilter) = self.get_mango_filter(selector_id)
	
			mcollection = self.mdb[collection]
	
			from bson.code import Code
	
			map = Code("function () {"
			"	if (this.source_type == 'host'){"
			"		if (this.state == 0){ emit('up', 1) }"
			"		else if (this.state == 1){ emit('down', 1) }"
			"		else if (this.state == 2){ emit('unreachable', 1) }"
			"		else if (this.state == 3){ emit('unreachable', 1) }"
			"	}"
			"	else if (this.source_type == 'service'){"
			"		if (this.state == 0){ emit('ok', 1) }"
			"		else if (this.state == 1){ emit('warning', 1) }"
			"		else if (this.state == 2){ emit('critical', 1) }"
			"		else if (this.state == 3){ emit('unknown', 1) }"
			"	}"
			"}")
	
			reduce = Code("function (key, values) {"
			"  var total = 0;"
			"  for (var i = 0; i < values.length; i++) {"
			"    total += values[i];"
			"  }"
			"  return total;"
			"}")
	
			output = {}
			if mcollection.find(mfilter).count() > 0:	
				result = mcollection.map_reduce(map, reduce, "myresults", query=mfilter)
				for doc in result.find():
					output[doc['_id']] = doc['value']
	
			self.set_mango_cache(cacheId, output)

		return output

	def get(self, selector):
		#items = self.get_items_by_selector(selector, ['state'])

		fields = ['up','down','unreachable','ok','warning', 'critical', 'unknown']

		output = self.map_reduce_field(selector, "state")

		total = 0
		for field in fields:
			try:
				value = output[field]
				total += value
			except:
				#output[field] = 0
				pass

		output['total'] = total


		output_pct = []
		for field in fields:
			try:
				value = output[field]
				output_pct.append([field, round((100 * value) / total)])
			except:
				#output_pct[field] = 0
				pass

	
		output = tornado.escape.json_encode([output, output_pct])
		self.write(output)

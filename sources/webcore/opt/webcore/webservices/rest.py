import tornado.web
import tornado.escape

import uuid
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

	def post(self, uri):
		selector = uri.split("/")[0]
		recordId = None
		try:
			recordId = uri.split("/")[1]
		except:
			print "Impossible to find RecordId in URI ..."
			raise tornado.web.HTTPError(404)

		print "######### Start POST (create/update) request"
		print "######### End of POST request"
	

	def get(self, uri):
		selector = uri.split("/")[0]
		recordId = None
		try:
			recordId = uri.split("/")[1]
		except:
			pass

		print "######### Start GET (display) request"
		#print "Use collection: %s" % collection
		print "Use selector: %s" % selector
		print "Record ID: %s" % recordId

		output = self.display(selector, recordId)
		#print "Output:\n", output
		self.write(output)
		print "######### End of GET request"


	## C.R.U.D.
	def create(self, mcollection, record):
		gid = str(uuid.uuid4())
		print "Create record %s ..." % gid
		record['_id'] = gid
		rid = mcollection.insert(record, safe=True)
		if rid == gid:
			success=True
		else:
			success=False

		## Format output
		output={'success': success}
		output = tornado.escape.json_encode(output)

		return output


	def remove(self):
		pass

	def update(self, mcollection):
		record = tornado.escape.json_decode(self.request.body)

		rid = record['_id']
		print "Id:", rid
		del(record['_id'])
		print "Record:", record
		
		if not rid:
			output = self.create(mcollection, record)
		else:
			print "Update record ..."
			moutput =  mcollection.update({'_id': rid}, {"$set": record}, safe=True)
			print "Mongo Output:", moutput
			#{u'updatedExisting': True, u'connectionId': 353, u'ok': 1.0, u'err': None, u'n': 1}

			if (moutput['err'] == None):
				success=True
			else:
				success=False

			## Format output
			output={'success': success, 'total': moutput['n']}
			output = tornado.escape.json_encode(output)

		return output


	def display(self, selector, recordId=None):
		
		SearchFilter = None
		SelectorFilter = None
		RecordFilter = None
		mfilter = {}
		output=[]

		### Parse arguments
		#selector=self.get_argument('selector', 'id-selector-list')
		
		limit=int(self.get_argument('limit', 20))
		page=int(self.get_argument('page', 0))
		start=int(self.get_argument('start', 0))
		
		groups=self.get_argument('group', None)

		print "Display %i records of '%s', begin at record %i " % (limit, selector, start)
		print "Grouped by %s" % groups

		## Live search
		search=self.get_argument('search', None)
		if search:
			fields=tornado.escape.json_decode(self.get_argument('fields', None))
			if fields:
				SearchFilter = {}
				filters = []
				print "Search: '", search, "' on", fields
				for field in fields:
					regexp = ".*%s.*" % search
					filters.append({ field: { '$regex': regexp, '$options': 'i' } })

			#SearchFilter['$or'] = filters
			SearchFilter = filters
			print "Search filter:", SearchFilter
 
		#	regexp = ".*%s.*" % search
		#	print regexp
		#	service_filter = { 'service_description': { '$regex': regexp, '$options': 'i' } }
		#	host_filter = { 'host_name': { '$regex': regexp, '$options': 'i' } } 
		#	mfilter['$or'] =  [ service_filter, host_filter ]
		
		## Get selector informations
		(collection, SelectorFilter) = self.get_mango_filter(selector)
		print "Collection: ", collection
		print "Selector filter:", SelectorFilter
		mcollection = self.mdb[collection]


		if recordId:
			RecordFilter = {'_id': recordId}
			print "Record filter:", RecordFilter

			output=mcollection.find_one(RecordFilter)
			if output:
				total=1
			else:
				total=0
				output=[]
		else:
			# Build filter
			mfilter = {}
			if SearchFilter:
				SelectorFilter['$or'] = SearchFilter

			mfilter = SelectorFilter

			print "Mongo Filter:", mfilter
			total=mcollection.find(mfilter).count()
			records = mcollection.find(mfilter)

			if groups:
				groups = tornado.escape.json_decode(groups)
				for group in groups:
					records = records.sort(group['property'])

			records = records.skip(start).limit(limit)

			for record in records:
				output.append(record)

	
		## Format output
		output={'total': total, 'success': True, 'data': output}
		output = tornado.escape.json_encode(output)
	
		return output
		

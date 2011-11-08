#!/usr/bin/env python

from pymongo import ASCENDING
from gridfs import GridFS

import pickle

from ctools import parse_perfdata
from crecord import crecord
from ccache import get_cache

import logging, time
import zlib, json, sys, base64

STEP_MIN = 59
CONFIG_CACHE_TIME=300
TS_TOLERANCE = 3
CACHE = get_cache()

# db.perfdata.dataSize()
# db.perfdata.totalSize()

class cperfstore(object):
	def __init__(self, storage, namespace='perfdata', logging_level=logging.INFO):
		self.storage = storage
		self.namespace = namespace
		self.backend = self.storage.get_backend(namespace)
		self.grid = GridFS(storage.db, namespace+".fs")

		self.logger = logging.getLogger('cperfstore')
		self.logger.setLevel(logging_level)

		self.logger.debug("Init cperfstore ...")

		self.last_timestamp = {}
		self.last_config = {}

	def get_config(self, _id):
		return self.storage.get(_id, namespace=self.namespace)

	def put(self, _id, perf_data, timestamp=0, checkts=False):
		timestamp = int(timestamp)
		now = int(time.time())

		self.logger.debug("Put perfdata of id '"+_id+"' ...")
		try:
			perf_data = parse_perfdata(perf_data)
		except:
			raise Exception("Imposible to parse: " + str(perf_data))

		try:
			if ((self.last_config[_id] + CONFIG_CACHE_TIME) < now):
				## Update config record ...
				del self.last_config[_id]
		except:
			pass

		## Check config
		try:
			last_config = self.last_config[_id]
		except:
			self.logger.debug("Update config record for '"+_id+"' ...")
			config = crecord({'_id': _id})
			config.chmod('o+r')

			config.data['metrics'] = []
			for metric in perf_data.keys():
				config.data['metrics'].append(metric)

			config.data['perf_data'] = perf_data

			self.storage.put(config, namespace=self.namespace)
			self.last_config[_id] = now
			self.last_timestamp[_id] = now - STEP_MIN
			

		if (checkts):
			checkts = now - (self.last_timestamp[_id] + STEP_MIN)
			if checkts < TS_TOLERANCE and checkts > -TS_TOLERANCE:
				checkts = False
			else:
				checkts = True

			if checkts:
				self.logger.error(" + Not the moment for "+_id+" (Interval:"+str(now-self.last_timestamp[_id])+")...")
				return

		self.last_timestamp[_id] = now
	
		#records = []
		for metric in perf_data.keys():
			## Store perfdata

			now = int(time.time())
			mid = _id + "." + metric
			value = perf_data[metric]['value']

			if int(value) == value:
				value = int(value)

			self.logger.debug(" + Put metric '"+metric+"' ("+str(value)+") for ts '"+str(now)+"' ...")


			if not self.backend.find_one({'_id': mid}):
				self.backend.insert({'_id': mid, 'id': mid, 'config': _id, 'metric': metric, 'first': now, 'last': now, 'format': 'plain' ,'values': [[now, value]] }, safe=True)
			else:
				self.backend.update({'_id': mid}, {"$set": {'last': now}, "$push": { 'values': [now, value] }}, upsert=True, safe=True)

			#records.append(data)

		#if records:
		#	backend = self.storage.get_backend('perfdata.'+_id)
		#	backend.insert(records)

	def get(self, _id, metric, start, stop):

		mid = _id + "." + metric

		start = int(start)
		stop = int(stop)

		self.backend.ensure_index([('last',ASCENDING)], ttl=300)

		data = []

		# Select records
		enc1 = { 'first': {'$lte': start}, 'last': {'$gte': stop} }
		enc2 = { 'first': {'$gte': start}, 'last': {'$lte': stop} }
		enc3 = { 'first': {'$gte': start}, 'last': {'$gte': stop}, 'first': {'$lte': stop} }
		enc4 = { 'first': {'$lte': start}, 'last': {'$gte': start}, 'last': {'$lte': stop} }
		mfilter = { 'id': mid, '$or': [enc1, enc2, enc3, enc4] }

		self.logger.debug(" + Mongo Filter: "+str(mfilter))
		rows = self.backend.find(mfilter);

		for row in rows:
			if row['format'] == 'gz':
				self.logger.debug(" + Decompress values ...")
				values = self.decompress_values(str(row['_id']))
			else:
				values = row['values']

			for value in values:
				if (value[0] >= start) and (value[0] <= stop):
					data.append(value)

		return 	data	

	def rotate(self):
		rows = self.backend.find({'aaa_owner': {'$exists' : True } })
		for row in rows:
			_id = row['_id']
			self.logger.debug("Rotate "+_id+":")
			for metric in row['metrics']:
				self.logger.debug(" + Metric '"+metric+"'")
				mid = _id + "." + metric
				self.rotate_mid(mid)
		pass

	def rotate_mid(self, mid):
		perfs = self.backend.find_one({'_id': mid}, safe=True)
		if perfs:
			self.logger.debug("   + Remove "+mid+" ...")
			self.backend.remove({'_id': mid})

			perfs['id'] = mid
			perfs['_id'] = mid + "." + str(int(time.time()))
			
			self.logger.debug("   + Compress values ...")
			#perfs['first'] = perfs['values'][0][0]
			#perfs['last'] = perfs['values'][len(perfs['values'])-1][0]

			(values, ratio) = self.compress_values(list(perfs['values']))

			#if ratio > 0:
			self.logger.debug("   + Use Compressed values ("+str(ratio)+"%)...")
			perfs['format'] = 'gz'
			self.grid.put(values, _id=perfs['_id'])
			perfs['values'] = []
			
			self.logger.debug("   + Save "+perfs['_id']+" ...")
			self.backend.insert(perfs, safe=True)
			

	def compress_values(self, values, level=9):
		bsize = sys.getsizeof(values)
		timestamps = []

		# Compress timestamp
		fts = values[0][0]
		first = fts
		i = 0
		for value in values:
			pts = value[0]
			values[i][0] = value[0] - fts
			if i:
				timestamps.append(values[i][0])
			fts = pts
			i += 1

		# Timestamp mean
		self.logger.debug("     + TS Intervals:\t" + str(timestamps))
		offset = 0
		if len(timestamps) > 1:
			timestamps = sorted(timestamps)
			offset = sum(timestamps)/len(timestamps)

		self.logger.debug("     + TS Offset:\t" + str(offset))

		if offset > 0:
			# Apply offset
			i = 0
			for value in values:
				## For first TS
				if i:
					ts = value[0] - offset
					#if ts < TS_TOLERANCE and ts > -TS_TOLERANCE:
					#	ts = 0

					if ts == 0:
						values[i] = values[i][1]
					else:
						values[i][0] = ts
				else:
					values[i] = values[i][1]

				i += 1
		

		values = json.dumps([[first, offset], values])
		values = values.replace(' ', '')
		self.logger.debug(values)

		values = zlib.compress(values, level)
		zsize = sys.getsizeof(values)

		#values = base64.b64encode(values)
		asize = sys.getsizeof(values)

		ratio = int(((bsize-asize)*100)/bsize)
		self.logger.debug("     + Original:\t" + str(bsize))
		self.logger.debug("     + Compressed:\t" + str(zsize))
		#self.logger.debug("     + Base64:\t\t" + str(asize))
		self.logger.debug("     + Ratio:\t\t"+str(ratio)+"%")
		return (values, ratio)

	@CACHE.deco('perfstore', 300)
	def decompress_values(self, _id):
		values = self.grid.get(_id).read()
		values = zlib.decompress(values)
		values = json.loads(values)

		fts = values[0][0]
		offset = values[0][1]
		values = values[1]

		i = 0
		for value in values:
			if not isinstance(value ,list):
				values[i] = [0, value]
			ts = values[i][0]
			if i:
				nts = fts + ts + offset
			else:
				nts = fts + ts
			values[i][0] = nts
			fts = nts
			i += 1

		return values

	def purge(self, _id):
		try:
			# Delete config
			#self.storage.remove(_id, namespace=self.namespace)

			# Delete Binaries
			rows = self.backend.find({'_id': { '$regex' : '^'+_id+'.\d*'} })
			for row in rows:
				self.grid.delete(row['_id'])

			# Delete rotate
			self.backend.remove({'_id': { '$regex' : '^'+_id+'.*'} })
		except:
			raise Exception('Impossible to find config record ...')
	
		



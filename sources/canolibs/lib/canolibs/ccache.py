#!/usr/bin/env python

#import logging
from crecord import crecord
import time

class ccache(object):
	def __init__(self, storage):
		self.storage = storage

	def make_record(self, _id):
		record = crecord()
		record.type = "cache"
		record._id = 'cache-'+_id
		record.access_owner=['r','w']
		record.access_group=[]
		record.access_other=[]
		record.access_unauth=[]
		return record

	def remove(self, _id):
		self.storage.remove('cache-'+_id)

	def put(self, _id, data):
		record = self.make_record(_id)
		record.data = data
		self.storage.put(record)
		
	def get(self, _id, freshness=10):
		try:
			record = self.storage.get('cache-'+_id)

			if record.write_time < (time.time() - freshness):
				self.remove(_id)
				return None
			else:
				return record.data
		except:
			return None
	

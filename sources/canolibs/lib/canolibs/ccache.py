#!/usr/bin/env python

#import logging
from crecord import crecord
import time

class ccache(object):
	def __init__(self, storage, namespace=None):
		self.storage = storage
		self.namespace = namespace

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
		self.storage.remove('cache-'+_id, namespace=self.namespace)

	def put(self, _id, data):
		record = self.make_record(_id)
		record.data = {'cached': data}
		self.storage.put(record, namespace=self.namespace)
		
	def get(self, _id, freshness=10):
		if freshness == -1:
			return None

		try:
			record = self.storage.get('cache-'+_id, namespace=self.namespace)

			if record.write_time < (time.time() - freshness) and freshness != 0:
				self.remove(_id)
				return None
			else:
				return record.data['cached']
		except:
			return None
	

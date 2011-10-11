#!/usr/bin/env python

#import logging
from crecord import crecord
from cstorage import cstorage
from caccount import caccount

import time

class ccache(object):
	def __init__(self, storage, namespace=None):
		self.storage = storage

		if not namespace:
			namespace = storage.namespace
		self.namespace = namespace

	def make_record(self, _id):
		record = crecord()
		record.type = "cache"
		#record._id = 'cache.'+_id
		record._id = _id
		record.access_owner=['r','w']
		record.access_group=[]
		record.access_other=[]
		record.access_unauth=[]
		return record

	def deco(self, _id='', freshness=10, args=[], account=None):
		def dec(func):
			def gave(*k,**a):
				try:
					logger = k[0].logger
				except:
					logger = None

				cid = _id
				for arg in k:
					if isinstance(arg, int) or isinstance(arg, str):
						cid += "." + str(arg)

				for arg in args:
					try:
						if isinstance(arg, int) or isinstance(arg, str):
							cid += "." + str(a[arg])
					except:
						pass

				data = self.get(cid, freshness, account)
				if data:
					if logger:
						logger.debug('   + Get from cache (%s)...' % cid)
					return data
				
				data = func(*k,**a)
				self.put(cid, data, account)
				return data
			return gave
		return dec

	def remove(self, _id, account=None):
		self.storage.remove('cache.'+_id, namespace=self.namespace, account=account)

	def put(self, _id, data, account=None):
		record = self.make_record('cache.'+_id)
		record.data = {'cached': data}
		self.storage.put(record, namespace=self.namespace, account=account)
		
	def get(self, _id, freshness=10, account=None):
		if freshness == -1:
			return None

		try:
			record = self.storage.get('cache.'+_id, namespace=self.namespace, account=account)

			if record.write_time < (time.time() - freshness) and freshness != 0:
				self.remove(_id)
				return None
			else:
				return record.data['cached']
		except:
			return None


## Cache Cache
CACHE = None
def get_cache(storage=None):
	global CACHE
		
	if not storage:
		storage = cstorage(caccount(), namespace='cache')

	if CACHE:
		return CACHE
	else:
		#global CACHE
		CACHE = ccache(storage, namespace='cache')	
		return CACHE

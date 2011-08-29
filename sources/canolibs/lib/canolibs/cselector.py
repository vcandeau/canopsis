#!/usr/bin/env python

#import logging
from crecord import crecord
from ccache import ccache
from ctimer import ctimer

from pymongo import objectid

import time
import json

class cselector(crecord):
	def __init__(self, name=None, _id=None, storage=None, *args):

		crecord.__init__(self, storage=storage, *args)

		#if isinstance(record, crecord):
		#	crecord.__init__(self, raw_record=record.dump())
		#else:
		#	crecord.__init__(self, *args)

		self.type = "selector"
		
		if not self.storage:
			raise Exception('You must specify storage !')

		self.timer = ctimer()
		self.cache_time = 60 # 1 minute
		self.data['mfilter'] = {}
		self.data['last_resolv_time'] = 0
		self.data['last_nb_records'] = 0
		self._ids = []

		if _id:
			self._id = _id
		else:
			if not name:
				raise Exception('You must specify name or _id !')
			self._id = "selector-"+self.storage.default_account.user+"-"+name
		
		try:
			record = self.storage.get(self._id)
			self.load(record.dump())
		except:
			pass

	def set_filter(self, mfilter):
		self.data['mfilter']=json.dumps(mfilter)

	def resolv(self):
		self.timer.start()	
		## get from cache	
		#_ids = self.cache.get(self._id, 10)
		#if _ids or _ids == []:
		#	return _ids

		# resolv filter ...
		self._ids = []
		mfilter = json.loads(self.data['mfilter'])
		records = self.storage.find(mfilter)	
		for record in records:
			self._ids.append(record._id)

		# Put in cache
		#self.cache.put(self._id, _ids)
		self.timer.stop()
		self.data['last_resolv_time'] = self.timer.elapsed
		self.data['last_nb_records'] = len(records)

		self.save()

		return records

	def match(self, _id):
		# check cache freshness
		if (self.data['last_resolv_time'] + self.cache_time) <= time.time():
			self.resolv()

		try:
			oid = objectid.ObjectId(_id)
		except:
			oid = _id

		if oid in self._ids:
			return True

		return False

	def cat(self):
		print "Id:\t\t\t", self._id
		print "Mfilter:\t\t", self.data['mfilter']
		print "Last Resolv Time:\t%.2f ms" % (self.data['last_resolv_time']*1000)
		print "Last Nb records:\t", self.data['last_nb_records'], "\n"


#################

#def cselector_getall(storage):
#	selectors = []
#	records = storage.find({'crecord_type': 'selector'})
#	for record in records:
#		selectors.append(cselector(record))
#	
#	return selectors

#def cselector_get(storage, user):
#	record = storage.get('account-'+user)
#	selector = cselector(record)
#	return selector
	

#!/usr/bin/env python

#import logging
from crecord import crecord
from ccache import ccache
from ctimer import ctimer
from ctools import calcul_pct
from pymongo import objectid

import time
import json
import logging


class cselector(crecord):
	def __init__(self, name=None, _id=None, storage=None, namespace=None, logging_level=logging.INFO, *args):

		crecord.__init__(self, storage=storage, data = {}, *args)

		#if isinstance(record, crecord):
		#	crecord.__init__(self, raw_record=record.dump())
		#else:
		#	crecord.__init__(self, *args)

		self.type = "selector"
		
		if not self.storage:
			raise Exception('You must specify storage !')

		self.timer = ctimer(logging_level=logging_level)
		self.cache_time = 60 # 1 minute
		self.data['mfilter'] = {}
		self.data['last_resolv_time'] = 0
		self.data['last_nb_records'] = 0
		self.state = 0

		self._ids = []

		self.mfilter = {}

		if namespace:
			self.namespace = namespace
		else:
			self.namespace = storage.namespace

		if _id:
			self._id = _id
		else:
			if not name:
				raise Exception('You must specify name or _id !')
			self._id = self.type+"-"+self.storage.account.user+"-"+name
		
		try:
			record = self.storage.get(self._id, namespace=namespace)
			self.load(record.dump())
		except:
			pass

	def dump(self):
		self.data['namespace'] = self.namespace
		self.data['state'] = self.state
		self.data['mfilter'] = json.dumps(self.mfilter)
		return crecord.dump(self)

	def load(self, dump):
		crecord.load(self, dump)
		self.mfilter = json.loads(self.data['mfilter'])
		self.namespace = self.data['namespace']
		self.state = self.data['state']

	def resolv(self):
		self.timer.start()	
		## get from cache	
		#_ids = self.cache.get(self._id, 10)
		#if _ids or _ids == []:
		#	return _ids

		# resolv filter ...
		self._ids = []

		records = self.storage.find(self.mfilter, namespace=self.namespace)
		state = 0
		for record in records:
			try:
				if record.data['state'] > state:
					state = record.data['state']
			except:
				pass
			self._ids.append(record._id)

		self.state = state

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

	def get_current_availability(self):

		## Use cache
		cid = self._id+".current_availability"
		#availability = self.cache.get(cid, 10)
		#if availability:
		#	self.logger.debug(" + From cache.")
		#	return (availability, calcul_pct(availability))

		## Caclul
		self.resolv()
		
		mfilter = self.mfilter

		from bson.code import Code
	
		mmap = Code("function () {"
		"	var state = this.state;"
		"	if (this.state_type == 0) {"
		"		state = this.previous_state"
		"	}"
		"	if (this.source_type == 'host'){"
		"		if (state == 0){ emit('ok', 1) }"
		"		else if (state == 1){ emit('critical', 1) }"
		"		else if (state == 2){ emit('unknown', 1) }"
		"		else if (state == 3){ emit('unknown', 1) }"
		"	}"
		"	else if (this.source_type == 'service'){"
		"		if (state == 0){ emit('ok', 1) }"
		"		else if (state == 1){ emit('warning', 1) }"
		"		else if (state == 2){ emit('critical', 1) }"
		"		else if (state == 3){ emit('unknown', 1) }"
		"	}"
		"}")

		mreduce = Code("function (key, values) {"
		"  var total = 0;"
		"  for (var i = 0; i < values.length; i++) {"
		"    total += values[i];"
		"  }"
		"  return total;"
		"}")



		availability = self.storage.map_reduce(mfilter, mmap, mreduce, namespace=self.namespace)
		availability_pct = calcul_pct(availability)

		## Put in cache
		#self.cache.put(cid, availability)

		## Check
		self.data['availability'] = availability
		self.data['availability_pct'] = availability_pct

		#self.logger.debug(" + Availabilityt:\t\t%s" % availability)
		#self.logger.debug(" + Availability pct:\t%s" % availability_pct)
		self.save()

		return (availability, availability_pct)

#	def cat(self):
#		print "Id:\t\t\t", self._id
#		print "Mfilter:\t\t", self.data['mfilter']
#		print "Last Resolv Time:\t%.2f ms" % (self.data['last_resolv_time']*1000)
#		print "Last Nb records:\t", self.data['last_nb_records'], "\n"


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
	

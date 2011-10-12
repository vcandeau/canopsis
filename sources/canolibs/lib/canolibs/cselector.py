#!/usr/bin/env python

#import logging
from crecord_ng import crecord_ng

from ccache import ccache
from ctimer import ctimer
from ctools import calcul_pct
from pymongo import objectid

from caccount import caccount
from cstorage import get_storage

from ctools import make_event

import time
import json
import logging


class cselector(crecord_ng):
	def __init__(self, namespace='inventory', type='selector',  mids=[], mfilter=None, logging_level=logging.INFO, *args, **kargs):

		## Default vars
		self.namespace = namespace
		self.mfilter = mfilter
		self.mids = mids
		self.timer = ctimer(logging_level=logging.INFO)
		self.nocache = False
		self.cache_time = 60
		self.last_resolv_time = 0
		self.last_nb_records = 0
		self.threshold_warn = 98
		self.threshold_crit = 95
		self.state = 0
		self.state_type = 1
		self._ids = []
		
		## Init
		crecord_ng.__init__(self, type=type, *args, **kargs)

	def dump(self):
		self.data['mids'] = self.mids
		self.data['namespace'] = self.namespace
		self.data['mfilter'] = json.dumps(self.mfilter)
		return crecord_ng.dump(self)

	def load(self, dump):
		crecord_ng.load(self, dump)
		self.mfilter = json.loads(self.data['mfilter'])
		self.namespace = self.data['namespace']
		self.mids = self.data['mids']

	def resolv(self, nocache=False):

		if not (nocache or self.nocache):
			# check cache freshness
			if (self.last_resolv_time + self.cache_time) > time.time():
				return self.records

		_ids = []

		records = []
		
		if self.mfilter or self.mfilter == {}:	
			records = self.storage.find(self.mfilter, namespace=self.namespace)

		if self.mids:
			for mid in self.mids:
				try:
					records.append(self.storage.get(mid, namespace=self.namespace))
				except:
					self.logger.error("'%s' not found in '%s' ..." % (mid, self.namespace))

		state = 0
		for record in records:
			try:
				#print "%s: %s" % (record._id, record.data['state'])
				if record.data['state'] > state:
					state = record.data['state']
			except:
				pass
			_ids.append(record._id)

		self.state = state

		# Put in cache
		#self.cache.put(self._id, _ids)

		#self.last_resolv_time = self.timer.elapsed
		self.last_nb_records = len(records)

		self._ids = _ids
		self.records = records

		self.save()

		return records

	def match(self, _id):
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
		self.availability = availability
		self.availability_pct = availability_pct

		#self.logger.debug(" + Availabilityt:\t\t%s" % availability)
		#self.logger.debug(" + Availability pct:\t%s" % availability_pct)

		self.check(autosave=False)
		self.save()

		return (availability, availability_pct)

	def check(self, autosave=True):
		
		result = self.availability_pct

		state = 0
		
		if result['ok'] < self.threshold_warn:
			state = 1

		if result['ok'] < self.threshold_crit:
			state = 2

		if self.state != state:
			self.state = state
			if autosave:
				self.save()

		return state

	def make_event(self):

		#'label'=value[UOM];[warn];[crit];[min];[max]
		ok = "'ok'=%s%%;%s;%s;0;100" % (self.availability_pct['ok'], self.threshold_warn, self.threshold_crit)
		warn = "'warn'=%s%%;0;0;0;100" % (self.availability_pct['warning'])
		crit = "'crit'=%s%%;0;0;0;100" % (self.availability_pct['critical'])
		unkn = "'unkn'=%s%%;0;0;0;100" % (self.availability_pct['unknown'])

		perf_data = ok + " " + warn + " " + crit + " " + unkn

		dump = make_event(service_description=self.name, source_name='sla2mongodb', source_type=self.type, host_name=self.storage.account.user, state_type=1, state=self.state, output='', perf_data=perf_data)

		return dump

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
	

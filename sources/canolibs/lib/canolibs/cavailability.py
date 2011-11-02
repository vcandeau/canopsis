#!/usr/bin/env python

from ccache import ccache
from cselector import cselector

from ctools import calcul_pct
from ctools import legend
from ctools import make_event

from datetime import datetime

import time
import json
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class cavailability(cselector):
	def __init__(self, *args, **kargs):

		## Default vars
		self.namespace = 'inventory'
		
		self.threshold_warn = 98
		self.threshold_crit = 95
		self.state = 0
		self.state_type = 1

		self.availability = {'ok': 1.0}
		self.pct = {'unknown': 0, 'warning': 0, 'ok': 100.0, 'critical': 0}

		## Init
		cselector.__init__(self, type='availability', *args, **kargs)

	def dump(self):
		self.data['threshold_warn'] = self.threshold_warn
		self.data['threshold_crit'] = self.threshold_crit

		self.data['availability'] = self.availability
		self.data['pct'] = self.pct

		self.data['state'] = self.state
		self.data['state_type'] = self.state_type
		return cselector.dump(self)

	def load(self, dump):
		cselector.load(self, dump)

		self.threshold_warn = self.data['threshold_warn']
		self.threshold_crit = self.data['threshold_crit']

		self.availability = self.data['availability']
		self.pct = self.data['pct']
		self.state = self.data['state']
		self.state_type = self.data['state_type']

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

		dump = make_event(service_description=self.name, source_type=self.type, host_name=self.storage.account.user, state_type=1, state=self.state, output='', perf_data=perf_data)

		return dump


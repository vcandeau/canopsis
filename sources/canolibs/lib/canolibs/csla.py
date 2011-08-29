#!/usr/bin/env python

from crecord import crecord
from ccache import ccache
from cselector import cselector
from ctimer import ctimer

import time
import json
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class csla(crecord):
	def __init__(self, name=None, _id=None, storage=None, cb_on_ok=None, cb_on_warn=None, cb_on_crit=None, selector=None, namespace=None, logging_level=logging.DEBUG, *args):

		crecord.__init__(self, storage=storage, *args)

		self.type = "sla"
		
		## Set storage
		if not storage:
			raise Exception('You must specify storage !')

		if _id:
			self._id = _id
		else:
			if not name:
				raise Exception('You must specify name or _id !')
			self._id = self.type+"-"+self.storage.account.user+"-"+name
		
		## Init logger
		self.logger = logging.getLogger(self._id)
		self.logger.setLevel(logging_level)

		## Init default var
		self.data['threshold_warn'] = 98
		self.data['threshold_crit'] = 95

		self.data['current'] = {'ok': 1}
		self.data['current_pct'] = {'ok': 100}
		self.data['state'] = 0
		self.data['state_type'] = 1

		self.data['selector_id'] = None
		self.selector = None
		self.namespace = None

		## Set callback function
		self.cb_on_warn = cb_on_warn
		self.cb_on_crit = cb_on_crit
		self.cb_on_ok = cb_on_ok

		## Init object
		try:	
			record = self.storage.get(self._id)
			self.load(record.dump())
			self.selector = cselector(_id=self.data['selector_id'], storage=self.storage)
		except:
			## Create
			if not selector:
				raise Exception('You must specify selector !')

			self.selector = selector
			self.data['selector_id'] = selector._id
			pass

	#def save(self):
	#	self.selector.save()
	#	crecord.save(self)

	def _cb_on_crit(self):
		self.logger.debug("Critical threshold reached ! (%s<%s)" % (self.data['current_pct']['ok'], self.data['threshold_crit']))
		if self.cb_on_crit:
			self.cb_on_crit(self)

	def _cb_on_warn(self):
		self.logger.debug("Warning threshold reached ! (%s<%s)" % (self.data['current_pct']['ok'], self.data['threshold_warn']))
		if self.cb_on_warn:
			self.cb_on_warn(self)

	def _cb_on_ok(self):
		self.logger.debug("Back to normal (%s>%s)" % (self.data['current_pct']['ok'], self.data['threshold_warn']))
		if self.cb_on_ok:
			self.cb_on_ok(self)

	def calcul_current(self):
		self.selector.resolv()
		self.logger.debug("Calcul current SLA ...")

		mfilter = self.selector.mfilter

		from bson.code import Code
	
		mmap = Code("function () {"
		"	if (this.source_type == 'host'){"
		"		if (this.state == 0){ emit('ok', 1) }"
		"		else if (this.state == 1){ emit('critical', 1) }"
		"		else if (this.state == 2){ emit('unknown', 1) }"
		"		else if (this.state == 3){ emit('unknown', 1) }"
		"	}"
		"	else if (this.source_type == 'service'){"
		"		if (this.state == 0){ emit('ok', 1) }"
		"		else if (this.state == 1){ emit('warning', 1) }"
		"		else if (this.state == 2){ emit('critical', 1) }"
		"		else if (this.state == 3){ emit('unknown', 1) }"
		"	}"
		"}")

		mreduce = Code("function (key, values) {"
		"  var total = 0;"
		"  for (var i = 0; i < values.length; i++) {"
		"    total += values[i];"
		"  }"
		"  return total;"
		"}")

		current = self.storage.map_reduce(mfilter, mmap, mreduce, namespace=self.namespace)
		
		## Get total
		total = 0
		for key in current.keys():
			value = current[key]
			total += value

		## Calc pct
		current_pct = {}
		for key in current.keys():
			value = current[key]
			current_pct[key] = float((value * 100) / total)

		## Check
		self.data['current'] = current
		self.data['current_pct'] = current_pct
		self.check()

		self.logger.debug(" + Current:\t%s" % current)
		self.logger.debug(" + Current pct:\t%s" % current_pct)

		return (current, current_pct)

	def check(self):
		
		sla = self.data['current_pct']

		state = 0
		if sla['ok'] < self.data['threshold_warn']:
			state = 1

		if sla['ok'] < self.data['threshold_crit']:
			state = 2

		if   state == 0 and self.data['state'] != state:
			self._cb_on_ok()
		elif state == 1:
			self._cb_on_warn()
		elif state == 2:
			self._cb_on_crit()

		if self.data['state'] != state:
			self.data['state'] = state
			self.save()

		return state
		
			
		
			

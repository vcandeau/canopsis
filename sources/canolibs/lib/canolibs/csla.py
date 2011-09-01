#!/usr/bin/env python

from crecord import crecord
from ccache import ccache
from cselector import cselector

from datetime import datetime

import time
import json
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class csla(crecord):
	def __init__(self, name=None, _id=None, storage=None, cb_on_state_change=None, selector=None, namespace=None, logging_level=logging.INFO, record=None, *args):

		self._id = _id

		## Set storage
		if not storage:
			raise Exception('You must specify storage !')

		self.storage = storage

		## Init default var
		self.data = {}
		self.data['threshold_warn'] = 98
		self.data['threshold_crit'] = 95

		self.data['availability'] = {'ok': 1.0}
		self.data['availability_pct'] = {'unknown': 0, 'warning': 0, 'ok': 100.0, 'critical': 0}
		self.data['state'] = 0
		self.data['state_type'] = 1

		self.data['selector_id'] = None
		self.selector = None
		self.namespace = None
	
		self.legend = ['ok','warning','critical','unknown']

		## Set callback function
		self.cb_on_state_change = cb_on_state_change

		## Init object
		if not record:
			if name:
				self._id = "sla-"+storage.account.user+"-"+name
			elif _id:
				self._id = _id		
			else:
				raise Exception('You must specify record, name or _id !')

		if not record:
			try:
				record = storage.get(self._id)
				record.cat()
			except Exception, err:
				print err
				record = None

		self.data['_id'] = self._id

		crecord.__init__(self, storage=storage, data = self.data, record=record, *args)

		self.type = 'sla'
		
		self.cache = ccache(storage, self.type)

		if not self.data['selector_id']:
			if not selector:
				raise Exception('You must specify selector !')
			else:
				self.data['selector_id'] = selector._id
				print selector._id 
				self.selector = selector
		else:
			self.selector = cselector(_id=self.data['selector_id'], storage=storage)

		if namespace:
			self.namespace = namespace
		else:
			self.namespace = self.selector.namespace

		## Init logger
		self.logger = logging.getLogger(self._id)
		self.logger.setLevel(logging_level)

	#def save(self):
	#	self.selector.save()
	#	crecord.save(self)

	def _cb_on_state_change(self, from_state, to_state):
		if   to_state == 0:
			self.logger.debug("Back to normal (%s>%s)" % (self.data['availability_pct']['ok'], self.data['threshold_warn']))
		elif to_state == 1:
			self.logger.debug("Warning threshold reached ! (%s<%s)" % (self.data['availability_pct']['ok'], self.data['threshold_warn']))
		elif to_state == 2:
			self.logger.debug("Critical threshold reached ! (%s<%s)" % (self.data['availability_pct']['ok'], self.data['threshold_crit']))

		if self.cb_on_state_change:
			try:
				self.cb_on_state_change(from_state, to_state)
			except Exception, err:
				self.logger.error("Error in  'cb_on_state_change': %s", err)

	def process_hourly(self, timestamp):
		date = datetime.fromtimestamp(timestamp)
		date = date.replace(minute = 0, second = 0)

		stop = int(time.mktime(date.timetuple()))
		start = stop - 3600 # 1 hour

		stop -= 1		

		self.get_sla_by_timeperiod(start, stop)

	def process_daily(self, timestamp):
		date = datetime.fromtimestamp(timestamp)
		date = date.replace(hour=0, minute = 0, second = 0)

		stop = int(time.mktime(date.timetuple()))
		start = stop - 86400 # 1 day

		stop -= 1

		self.get_sla_by_timeperiod(start, stop)

	def get_sla_by_timeperiod(self, start, stop):

		cid = self._id+"."+str(start)+"-"+str(stop)

		# get from cache
		sla = self.cache.get(cid, 0)
		if not sla:
			(sla, sla_pct) = self.calcul_by_timeperiod(start, stop)
			self.cache.put(cid, sla)
		else:
			self.logger.debug("Allready in cache.")
			sla_pct = self.calcul_pct(sla)

		return (sla, sla_pct)

	def get_current_availability(self):
		
		self.logger.debug("Calcul current SLA ...")

		## Use cache
		cid = self._id+".current_availability"
		availability = self.cache.get(cid, 10)
		if availability:
			return (availability, self.calcul_pct(availability))

		## Caclul
		self.selector.resolv()
		
		mfilter = self.selector.mfilter

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
		availability_pct = self.calcul_pct(availability)

		## Put in cache
		self.cache.put(cid, availability)

		## Check
		self.data['availability'] = availability
		self.data['availability_pct'] = availability_pct
		self.check()

		self.logger.debug(" + Availabilityt:\t\t%s" % availability)
		self.logger.debug(" + Availability pct:\t%s" % availability_pct)
		self.save()

		return (availability, availability_pct)

	def calcul_pct(self, data, total=None):
		if not total:
			## Get total
			total = 0
			for key in data.keys():
				value = data[key]
				total += value

		## Calc pct
		data_pct = {}
		for key in data.keys():
			value = data[key]
			data_pct[key] = round(((float(value) * 100) / float(total)), 2)

		## Fix empty value
		for key in self.legend:
			try:
				value = data_pct[key]
			except:
				data_pct[key] = 0

		return data_pct

	def check(self, result=None):
		
		if not result:
			result = self.data['availability_pct']

		state = 0
		
		if result['ok'] < self.data['threshold_warn']:
			state = 1

		if result['ok'] < self.data['threshold_crit']:
			state = 2

		if self.data['state'] != state:
			self._cb_on_state_change(self.data['state'], state)
			self.data['state'] = state
			self.save()

		return state
		
	def get_initial_state(self, _id, timestamp):
		#fields = {'state': 1, 'state_type': 1}
		
		record = self.storage.find_one(mfilter={'inventory_id': _id, 'timestamp': {'$lte': timestamp}, 'state_type': 1 }, namespace='history')
		if record:
			return record.data['state']
		else:
			return 0

	def calcul_by_timeperiod(self, start, stop):
		sla = {}
		window = stop - start

		records = self.selector.resolv()

		## Get sla for each ID
		allsla = []
		for _id in self.selector._ids:
			(mysla, mysla_pct) = self.calcul_by_timeperiod_for_id( _id, start, stop)
			allsla.append(mysla)

		## Agreg SLA
		for mysla in allsla:
			for key in mysla.keys():
				try:
					sla[key] += mysla[key]
				except:
					sla[key] = mysla[key]		

		## Cal pct
		sla_pct = self.calcul_pct(sla)

		self.logger.debug(" + For timeperiod %s -> %s" % (start, stop))
		self.logger.debug("     + Current:\t\t%s" % sla)
		self.logger.debug("     + Current pct:\t%s" % sla_pct)

		return (sla, sla_pct)

	def calcul_by_timeperiod_for_id(self, _id, start, stop):
		## Calcul time for each events
		initial_state = self.get_initial_state(_id, start)

		events = self.storage.find(mfilter={'inventory_id': _id, 'timestamp': {'$gte': start, '$lte': stop} }, namespace='history', sort='timestamp')
		
		sla = {}
		cursor = start
		window = stop - start
		for event in events:
			stime = int(event.data['timestamp']) - cursor
			cursor = event.data['timestamp']
			
			try:
				sla[self.legend[initial_state]] += stime
			except:
				sla[self.legend[initial_state]] = stime

			initial_state = event.data['state']

		if cursor < stop:
			stime = stop - cursor
			
			try:
				sla[self.legend[initial_state]] += stime
			except:
				sla[self.legend[initial_state]] = stime

		sla_pct = self.calcul_pct(sla, window)

		self.logger.debug(" + Hard Current:\t\t%s" % sla)
		self.logger.debug(" + Hard Current pct:\t%s" % sla_pct)

		return (sla, sla_pct)

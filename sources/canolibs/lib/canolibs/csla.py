#!/usr/bin/env python

from crecord import crecord
from ccache import ccache
from cselector import cselector

from ctools import calcul_pct
from ctools import legend

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

		self.data['sla'] = {'ok': 1.0}
		self.data['sla_pct'] = {'unknown': 0, 'warning': 0, 'ok': 100.0, 'critical': 0}
		self.data['state'] = 0
		self.data['state_type'] = 1

		self.data['selector_id'] = None
		self.selector = None
		self.slippery = False
		self.cycle = 86400 # 24 hours
		self.start = None
		self.stop = None
		self.active = True

		## Set callback function
		self.cb_on_state_change = cb_on_state_change

		## Init object
		if not record:
			if name:
				self._id = "sla-"+storage.account.user+"-"+name
				self.name = name
			elif _id:
				self._id = _id		
			else:
				raise Exception('You must specify record, name or _id !')
		else:
			self._id = record._id

		## Init logger
		self.logger = logging.getLogger(self._id)
		self.logger.setLevel(logging_level)

		self.logger.debug("My _id is '%s'" % self._id)

		if not record:
			try:
				self.logger.debug("Get my record ...")
				record = storage.get(self._id)
				self.logger.debug(" + Ok")
			except Exception, err:
				#print err
				self.logger.debug(" + I'm not saved.")
				record = None

		self.data['_id'] = self._id

		if record:
			self.logger.debug("Init from record ...")
			crecord.__init__(self, storage=storage, data = {}, record=record, *args)
			self.logger.debug(" + Ok")
		else:
			self.logger.debug("Init with default values ...")
			crecord.__init__(self, storage=storage, name=name, data = self.data, *args)
			self.logger.debug(" + Ok")

		self.type = 'sla'
		
		self.logger.debug("Init Cache ...")
		self.cache = ccache(storage, self.type)
		self.logger.debug(" + Ok")

		self.logger.debug("Init my selector ...")
		if not self.data['selector_id']:
			if not selector:
				raise Exception('You must specify selector !')
			else:
				self.logger.debug(" + get selector from argument")
				self.data['selector_id'] = selector._id
				self.selector = selector
				self.logger.debug("   + Ok")
		else:
			self.logger.debug(" + get selector '%s' from DB" % self.data['selector_id'])
			self.selector = cselector(_id=self.data['selector_id'], storage=storage)
			self.logger.debug("   + Ok")
		
		#if namespace:
		#	self.namespace = namespace
		#else:
		#	self.namespace = self.selector.namespace
		#
		#self.logger.debug("Use Namespace: %s" % self.namespace)

	def dump(self):
		self.data['slippery'] = self.slippery
		self.data['cycle'] = self.cycle
		self.data['start'] = self.start
		self.data['stop'] = self.stop
		self.data['active'] = self.active
		return crecord.dump(self)

	def load(self, dump):
		crecord.load(self, dump)
		self.slippery = self.data['slippery']
		self.cycle = self.data['cycle']
		self.start = self.data['start']
		self.stop = self.data['stop']
		self.active = self.data['active']

	#def save(self):
	#	self.selector.save()
	#	crecord.save(self)

	def _cb_on_state_change(self, from_state, to_state):
		if   to_state == 0:
			self.logger.debug("Back to normal (%s>%s)" % (self.data['sla_pct']['ok'], self.data['threshold_warn']))
		elif to_state == 1:
			self.logger.debug("Warning threshold reached ! (%s<%s)" % (self.data['sla_pct']['ok'], self.data['threshold_warn']))
		elif to_state == 2:
			self.logger.debug("Critical threshold reached ! (%s<%s)" % (self.data['sla_pct']['ok'], self.data['threshold_crit']))

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

	def set_threshold(self, warn, crit):
		self.data['threshold_warn'] = warn
		self.data['threshold_crit'] = crit

	def set_cycle(self, start, cycle, slippery=True):
		self.start = start
		self.stop = start + cycle
		self.cycle = cycle
		self.slippery = slippery

	def get_sla(self, stop=None, cachetime=50):
		self.logger.debug("Calcul current SLA ...")
		
		if not self.active:
			self.logger.debug(" + SLA is outdated.")
			return
		
		if stop:
			now = stop
			stop = stop
			start = stop - self.cycle
		else:
			now = int(time.time())
			if self.slippery:
				stop = int(time.time())
				start = stop - self.cycle
			else:
				start = self.start
				stop = self.stop

		self.logger.debug(" + Now: %s" % now)
		self.logger.debug(" + Start: %s" % start)
		self.logger.debug(" + Stop: %s" % stop)

		## outdated by 30 sec
		if stop < (now - 30):
			self.logger.debug(" + Last one ...")
			self.active = False
			self.save()

		## Not started
		if start > now:
			self.logger.debug(" + Not the moment ...")
			return

		if (start or start == 0) and stop:
			(sla, sla_pct) = self.get_sla_by_timeperiod(start, stop, cachetime=cachetime)
			if sla != self.data['sla']:
				self.data['sla'] = sla
				self.data['sla_pct'] = sla_pct
				self.check(autosave=False)
				self.save()

	def get_sla_by_timeperiod(self, start, stop, cachetime=0):

		self.logger.debug("Get SLA between %s and %s" % (start, stop))
		cid = self._id+"."+str(start)+"-"+str(stop)

		# get from cache
		sla = self.cache.get(cid, cachetime)

		if not sla:
			(sla, sla_pct) = self.calcul_by_timeperiod(start, stop)
			self.cache.put(cid, sla)
		else:
			self.logger.debug(" + From cache.")
			sla_pct = calcul_pct(sla)

		return (sla, sla_pct)

	def check(self, result=None, autosave=True):
		
		if not result:
			result = self.data['sla_pct']

		state = 0
		
		if result['ok'] < self.data['threshold_warn']:
			state = 1

		if result['ok'] < self.data['threshold_crit']:
			state = 2

		if self.data['state'] != state:
			self._cb_on_state_change(self.data['state'], state)
			self.data['state'] = state
			if autosave:
				self.save()

		return state
		
	def get_initial_state(self, _id, timestamp):
		#fields = {'state': 1, 'state_type': 1}
		#self.logger.debug("Get initial state of '%s' on %s" % (_id, timestamp))

		mfilter={'inventory_id': _id, 'timestamp': {'$lte': timestamp}, 'state_type': 1 }
		record = self.storage.find_one(mfilter=mfilter, namespace='history')
		if record:
			return record.data['state']
		else:
			return 3

	def calcul_by_timeperiod(self, start, stop):
		sla = {}
		now = int(time.time())
		if stop > now:
			stop = now

		if start > now:
			return (self.data['sla'], self.data['sla_pct'])

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
		sla_pct = calcul_pct(sla)

		self.logger.debug(" + For timeperiod %s -> %s" % (start, stop))
		self.logger.debug("     + Current:\t\t%s" % sla)
		self.logger.debug("     + Current pct:\t%s" % sla_pct)

		return (sla, sla_pct)

	def calcul_by_timeperiod_for_id(self, _id, start, stop):
		## Calcul time for each events
		initial_state = self.get_initial_state(_id, start)

		events = self.storage.find(mfilter={'inventory_id': _id, 'state_type': 1, 'timestamp': {'$gte': start, '$lte': stop} }, namespace='history', sort=[('timestamp',1)] )
		
		sla = {}
		cursor = start
		window = stop - start
		for event in events:
			stime = int(event.data['timestamp']) - cursor
			cursor = event.data['timestamp']
			
			try:
				sla[legend[initial_state]] += stime
			except:
				sla[legend[initial_state]] = stime

			initial_state = event.data['state']

		if cursor < stop:
			stime = stop - cursor
			
			try:
				sla[legend[initial_state]] += stime
			except:
				sla[legend[initial_state]] = stime

		sla_pct = calcul_pct(sla, window)

		#self.logger.debug(" - %s" % _id)
		#self.logger.debug("  + Hard Current:\t\t%s" % sla)
		#self.logger.debug("  + Hard Current pct:\t%s" % sla_pct)

		return (sla, sla_pct)

	def dump_event(self):
		dump = {}

		dump['source_name'] = 'Worker'
		dump['source_type'] = self.type
		dump['service_description'] =  self._id
		dump['host_name'] = self.type
		dump['rk'] = 'eventsource.canopsis.' + dump['source_name'] + '.check.'+ dump['source_type'] + "." + dump['service_description']
		dump['state_type'] = 1
		dump['state'] = self.data['state']
		dump['output'] = ''
		dump['timestamp'] = int(time.time())
		#'label'=value[UOM];[warn];[crit];[min];[max]
		ok = "'ok'=%s%%;%s;%s;0;100" % (self.data['sla_pct']['ok'], self.data['threshold_warn'], self.data['threshold_crit'])
		warn = "'warn'=%s%%;0;0;0;100" % (self.data['sla_pct']['warning'])
		crit = "'crit'=%s%%;0;0;0;100" % (self.data['sla_pct']['critical'])
		unkn = "'unkn'=%s%%;0;0;0;100" % (self.data['sla_pct']['unknown'])

		dump['perf_data'] = ok + " " + warn + " " + crit + " " + unkn

		return dump

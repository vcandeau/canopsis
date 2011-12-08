#!/usr/bin/env python
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------

from ccache import ccache
from cselector import cselector

from ctools import calcul_pct
from ctools import legend
import cevent

from datetime import datetime

import time
import json
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class csla(cselector):
	def __init__(self, cb_on_state_change=None, *args, **kargs):

		## Default vars
		self.namespace = 'history'
		self.slippery = False
		self.cycle = 86400 # 24 hours
		self.start = None
		self.stop = None
		self.active = True,
		self.sla = {'ok': 1.0}
		self.sla_pct = {'unknown': 0, 'warning': 0, 'ok': 100.0, 'critical': 0}
		self.cb_on_state_change = cb_on_state_change

		self.state = 0
		self.state_type = 1

		## Init
		cselector.__init__(self, type='sla', *args, **kargs)

	def dump(self):
		self.data['slippery'] = self.slippery
		self.data['cycle'] = self.cycle
		self.data['start'] = self.start
		self.data['stop'] = self.stop
		self.data['active'] = self.active

		self.data['threshold_warn'] = self.threshold_warn
		self.data['threshold_crit'] = self.threshold_crit

		self.data['sla'] = self.sla
		self.data['sla_pct'] = self.sla_pct
		self.data['state'] = self.state
		self.data['state_type'] = self.state_type
		return cselector.dump(self)

	def load(self, dump):
		cselector.load(self, dump)
		self.slippery = self.data['slippery']
		self.cycle = self.data['cycle']
		self.start = self.data['start']
		self.stop = self.data['stop']
		self.active = self.data['active']

		self.threshold_warn = self.data['threshold_warn']
		self.threshold_crit = self.data['threshold_crit']

		self.sla = self.data['sla']
		self.sla_pct = self.data['sla_pct']
		self.state = self.data['state']
		self.state_type = self.data['state_type']

	def _cb_on_state_change(self, from_state, to_state):
		if   to_state == 0:
			self.logger.debug("Back to normal (%s>%s)" % (self.sla_pct['ok'], self.threshold_warn))
		elif to_state == 1:
			self.logger.debug("Warning threshold reached ! (%s<%s)" % (self.sla_pct['ok'], self.threshold_warn))
		elif to_state == 2:
			self.logger.debug("Critical threshold reached ! (%s<%s)" % (self.sla_pct['ok'], self.threshold_crit))

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
		self.threshold_warn = warn
		self.threshold_crit = crit

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

			if sla != self.sla:
				self.sla = sla
				self.sla_pct = sla_pct
				self.check(autosave=False)
				self.save()

	def get_sla_by_timeperiod(self, start, stop, cachetime=0):
		self.logger.debug("Get SLA between %s and %s" % (start, stop))
		cid = self._id+"."+str(start)+"-"+str(stop)

		# get from cache
		#sla = self.cache.get(cid, cachetime)

		#if not sla:
		(sla, sla_pct) = self.calcul_by_timeperiod(start, stop)
		#	self.cache.put(cid, sla)
		#else:
		#	self.logger.debug(" + From cache.")
		#	sla_pct = calcul_pct(sla)

		return (sla, sla_pct)

	def check(self, result=None, autosave=True):
		
		if not result:
			result = self.sla_pct

		state = 0
		
		if result['ok'] < self.threshold_warn:
			state = 1

		if result['ok'] < self.threshold_crit:
			state = 2

		if self.state != state:
			self._cb_on_state_change(self.state, state)
			self.state = state
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
			return (self.sla, self.sla_pct)

		window = stop - start

		self.resolv()
		print "_ids:", self._ids
		## Get sla for each ID
		allsla = []
		for _id in self._ids:
			self.logger.debug("   + Calcul for %s" % _id)
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

	def make_event(self):
	
		#'label'=value[UOM];[warn];[crit];[min];[max]
		ok = "'ok'=%s%%;%s;%s;0;100" % (self.sla_pct['ok'], self.threshold_warn, self.threshold_crit)
		warn = "'warn'=%s%%;0;0;0;100" % (self.sla_pct['warning'])
		crit = "'crit'=%s%%;0;0;0;100" % (self.sla_pct['critical'])
		unkn = "'unkn'=%s%%;0;0;0;100" % (self.sla_pct['unknown'])

		perf_data = ok + " " + warn + " " + crit + " " + unkn
	
		return cevent.forger(connector='sla', connector_name='canopsis', event_type='sla', state=self.state,  perf_data=perf_data)

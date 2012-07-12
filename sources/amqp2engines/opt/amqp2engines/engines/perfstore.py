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

from pyperfstore import node
from pyperfstore import mongostore

from ctools import parse_perfdata
from ctools import Str2Number

from cengine import cengine

NAME="perfstore"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.rotate_plan = {
			'PLAIN': 0,
			'TSC': 3,
		}
		self.point_per_dca = None
		
		self.storage = mongostore(mongo_collection='perfdata')
		
	"""
		## TODO: Improve perf ....
		self.cache_node = {}
		
	def get_node(self, _id, *args, **kargs):
		mynode = self.cache_node.get(_id, None)
		if not mynode:
			mynode = node(_id=_id, *args, **kargs)
			self.cache_node[_id] = mynode
			
		return mynode
	"""
		
	def to_perfstore(self, _id, perf_data, timestamp, dn=None):
		
		if isinstance(perf_data, list):
	
			try:
				mynode = node(	_id=_id,
										dn=dn,
										storage=self.storage,
										point_per_dca=self.point_per_dca,
										rotate_plan=self.rotate_plan)
								
			except Exception, err:
				raise Exception("Imposible to init node: %s (%s)" % (_id, err))

			#[ {'min': 0.0, 'metric': u'rta', 'value': 0.097, 'warn': 100.0, 'crit': 500.0, 'unit': u'ms'}, {'min': 0.0, 'metric': u'pl', 'value': 0.0, 'warn': 20.0, 'crit': 60.0, 'unit': u'%'} ]

			for perf in perf_data:
				
				dn = perf['metric']
				value = perf['value']
				
				dtype = perf.get('type', None)
				unit = perf.get('unit', None)
				
				if unit:
					unit = str(unit)
					
				vmin =	perf.get('min', None)
				vmax =	perf.get('max', None)
				vwarn =	perf.get('warn', None)
				vcrit =	perf.get('crit', None)
				retention =	perf.get('retention', None)

				if vmin:
					vmin = Str2Number(vmin)
				if vmax:
					vmax = Str2Number(vmax)
				if vwarn:
					vwarn = Str2Number(vwarn)
				if vcrit:
					vcrit = Str2Number(vcrit)

				value = Str2Number(value)
					
				self.logger.debug(" + Put metric '%s' (%s %s (%s)) for ts %s ..." % (dn, value, unit, dtype, timestamp))

				try:
					mynode.metric_push_value(dn=dn, unit=unit, value=value, timestamp=timestamp, dtype=dtype, min_value=vmin, max_value=vmax, thld_warn_value=vwarn, thld_crit_value=vcrit)
				except Exception, err:
					self.logger.warning('Impossible to put value in perfstore (%s) (metric=%s, unit=%s, value=%s)', err, dn, unit, value)
			
		else:
			raise Exception("Imposible to parse: %s (is not a list)" % perf_data)
		 
	def work(self, event, *args, **kargs):
		## Metrology
		timestamp = int(event['timestamp'])

		## Get perfdata
		perf_data = event.get('perf_data', None)
		perf_data_array = event.get('perf_data_array', [])
		
		### Parse perfdata
		if perf_data:
			self.logger.debug(' + perf_data: %s', perf_data)
			try:
				perf_data_array = parse_perfdata(perf_data)
			except Exception, err:
				self.logger.error("Impossible to parse: %s ('%s')" % (perf_data, err))
		
		self.logger.debug(' + perf_data_array: %s', perf_data_array)
		
		### Add status informations
		if   event['event_type'] == 'check' or event['event_type'] == 'selector':
			state = int(event['state'])
			state_type = int(event['state_type'])
			state_extra = 0
			# Multiplex state
			cps_state = state * 100 + state_type * 10 + state_extra
			perf_data_array.append({"metric": "cps_state", "value": cps_state})
			
		event['perf_data_array'] = perf_data_array

		### Store perfdata
		if perf_data_array:
			try:
				dn = None
				if event['source_type'] == 'resource':
					#dn = "%s - %s" % (event['component'], event['resource'])
					dn = [ event['component'], event['resource'] ]
					
				elif event['source_type'] == 'component':
					dn = [ event['component'] ]
				
				self.to_perfstore(	_id=event['rk'],
									perf_data=perf_data_array,
									timestamp=timestamp,
									dn=dn)
								
			except Exception, err:
				self.logger.warning("Impossible to store: %s ('%s')" % (perf_data_array, err))
		
		return event

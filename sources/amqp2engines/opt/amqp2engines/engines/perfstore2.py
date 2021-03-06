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

import pyperfstore2

from ctools import parse_perfdata
from ctools import Str2Number

from cengine import cengine

NAME="perfstore2"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.beat_interval =  900
		
	def pre_run(self):
		import logging
		self.manager = pyperfstore2.manager(auto_rotate=True, logging_level=logging.INFO)
		
	def beat(self):
		pass
		
	def to_perfstore(self, rk, perf_data, timestamp, component, resource=None):
		
		if isinstance(perf_data, list):
			#[ {'min': 0.0, 'metric': u'rta', 'value': 0.097, 'warn': 100.0, 'crit': 500.0, 'unit': u'ms'}, {'min': 0.0, 'metric': u'pl', 'value': 0.0, 'warn': 20.0, 'crit': 60.0, 'unit': u'%'} ]

			for perf in perf_data:
				
				metric = perf['metric']
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
					
				self.logger.debug(" + Put metric '%s' (%s %s (%s)) for ts %s ..." % (metric, value, unit, dtype, timestamp))
				
				try:
					# Build Name with "component + resource + metric"
					name=None
					if not resource:
						name = "%s%s" % (component, metric)
					else:
						name = "%s%s%s" % (component, resource, metric)
						
					self.manager.push(name=name, value=value, timestamp=timestamp, meta_data={'type': dtype, 'min': vmin, 'max': vmax, 'thd_warn': vwarn, 'thd_crit': vcrit, 'co': component, 're': resource, 'me': metric ,'unit':unit})
				except Exception, err:
					self.logger.warning('Impossible to put value in perfstore (%s) (metric=%s, unit=%s, value=%s)', err, metric, unit, value)
			
		else:
			raise Exception("Imposible to parse: %s (is not a list)" % perf_data)
		 
	def work(self, event, *args, **kargs):
		## Metrology
		timestamp = int(event['timestamp'])

		## Get perfdata
		perf_data = event.get('perf_data', None)
		perf_data_array = event.get('perf_data_array', [])
		
		if perf_data_array == None:
			perf_data_array = []
		
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
				self.to_perfstore(	rk=event['rk'],
									component=event['component'],
									resource=event.get('resource', None),
									perf_data=perf_data_array,
									timestamp=timestamp
				)
								
			except Exception, err:
				self.logger.warning("Impossible to store: %s ('%s')" % (perf_data_array, err))
		
		return event

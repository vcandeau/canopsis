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
			'PLAIN': 1,
			'TSC': 0,
		}
		self.point_per_dca = None
		
		self.storage = mongostore(mongo_collection='perfdata')
	
	def parse_value(self, data, key, default=None):
		try:
			return data[key]
		except:
			return default

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
				
				metric = perf['metric']
				value = perf['value']
				
				dtype = self.parse_value(perf, 'type')		
				unit = self.parse_value(perf, 'unit')
				
				if unit:
					unit = str(unit)
					
				vmin =	self.parse_value(perf, 'min')
				vmax =	self.parse_value(perf, 'max')
				vwarn =	self.parse_value(perf, 'warn')
				vcrit =	self.parse_value(perf, 'crit')

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
					mynode.metric_push_value(dn=metric, unit=unit, value=value, timestamp=timestamp, dtype=dtype, min_value=vmin, max_value=vmax, thld_warn_value=vwarn, thld_crit_value=vcrit)
				except Exception, err:
					self.logger.warning('Impossible to put value in perfstore (%s) (metric=%s, unit=%s, value=%s)', err, metric, unit, value)
			
			#del mynode
			
			return perf_data
			
		else:
			raise Exception("Imposible to parse: %s (is not a list)" % perf_data)
		 
	def work(self, event, msg):
		## Metrology
		timestamp = int(event['timestamp'])
		perf_data_array = []
		perf_data = None
		
		## Get perfdata
		try:
			perf_data = event['perf_data']
		except:
			pass
			
		try:
			perf_data_array = list(event['perf_data_array'])
		except:
			pass
		
		### Parse perfdata
		if perf_data:
			self.logger.debug(' + perf_data: %s', perf_data)
			try:
				perf_data_array = parse_perfdata(perf_data)
			except Exception, err:
				self.logger.error("Impossible to parse: %s ('%s')" % (perf_data, err))
		
		self.logger.debug(' + perf_data_array: %s', perf_data_array)
		
		### Add status informations
		if   event['event_type'] == 'check':
			state = int(event['state'])
			state_type = int(event['state_type'])
			state_extra = 0
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

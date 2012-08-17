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

from cengine import cengine
from caccount import caccount
from cstorage import get_storage
#from pyperfstore import node
#from pyperfstore import mongostore
import pyperfstore2
import cevent
import time
import logging

NAME="sla"

states_str = ("Ok", "Warning", "Critical", "Unknown")
states = {0: 0, 1:0, 2:0, 3:0}

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.create_queue = False
				
		self.beat_interval =  900
		
		self.resource = "sla"
		
		self.thd_warn_sla_timewindow = 98
		self.thd_crit_sla_timewindow = 95
		self.default_sla_timewindow = 60*60*24 # 1 day
		
		self.default_sla_output_tpl="{cps_pct_by_state_0}% Ok, {cps_pct_by_state_1}% Warning, {cps_pct_by_state_2}% Critical, {cps_pct_by_state_3}% Unknown"

	def pre_run(self):
		self.storage = get_storage(namespace='object', account=caccount(user="root", group="root"))
		self.manager = pyperfstore2.manager(logging_level=logging.DEBUG)
		self.beat()
		
	def split_state(self, value):
		# cps_state = state * 100 + state_type * 10 + state_extra
		try:
			value = str(value)
			
			if len(value) == 2:
				value = "0%s" % value
				
			state = int(value[0])
			state_type = int(value[1])
			extra = int(value[2])
		except Exception, err:
			self.logger.error("Invalid value format: %s (%s)" % (value, err))
			raise Exception("Invalid value format: %s (%s)" % (value, err))
			
		return (state, state_type, extra)
	
	def get_states(self, name, metric, start, stop):
		metric_name = '%s%s' % (name,metric)
		try:
			points = self.manager.get_points(name=metric_name, tstart=start, tstop=stop)
		except:
			return []

		return points
		
	def get_rk(self, name):
		return "sla.engine.sla.resource.%s.sla" % name
		
	def get_name(self,name):
		return '%ssla' % name
	
	def calcul_time_by_state(self, _id, config):
		rk = config['rk']
		name = config['name']
		
		self.logger.debug("Calcul time by state")
		self.logger.debug(" + Get States of %s (%s)" % (_id, rk))
			
		sla_timewindow = config.get('sla_timewindow', self.default_sla_timewindow)
			
		sla_interval   = config.get('sla_interval', sla_timewindow)
		sla_lastcalcul = config.get('sla_lastcalcul', int(time.time() - sla_interval))
			
		stop = int(time.time())
		start = sla_lastcalcul
		
		self.logger.debug(" + sla_lastcalcul: %s" % sla_lastcalcul)
		self.logger.debug(" + start:          %s" % start)
		self.logger.debug(" + stop:           %s" % stop)
			
		points = self.get_states(name, "cps_state", start, stop)
					
		if len(points) >= 2:
				
			first_point = points[0]
			last_point = points[len(points)-1]				
				
			# Get the first state (initial) of serie
			if start == first_point[0]:
				(last_state, state_type, extra) = self.split_state(first_point[1])
				self.logger.debug(" + Set last state to %s (initial)" % last_state)
					
				# Remove first point
				del points[0]
			else:
				last_state = 0
				start = first_point[0]
				self.logger.debug(" + Set last state to default: %s (initial)" % last_state)
				self.logger.debug(" + New start:                 %s" % start)
					
			# Calcul each state's time for period start -> stop
			self.logger.debug(" + Parse Points:")
			states_sum = states.copy()
			total = 0
			last_timestamp = start
			for point in points:
				timestamp = point[0]
				value = point[1]
					
				try:
					(state, state_type, extra) = self.split_state(value)
						
					interval = timestamp - last_timestamp
					states_sum[last_state] += interval
					total += interval
										
					self.logger.debug("   + %s: interval (%s): state: %s, state_type: %s, extra: %s, last_state: %s" % (timestamp, interval, state, state_type, extra, last_state))
						
					last_state = state
					last_timestamp = timestamp
						
				except Exception, err:
					self.logger.error("Error in parsing: %s" % err)
				
			self.logger.debug(" + Total: %s" % total)	
			self.logger.debug(" + States: %s" % states_sum)
				
			# Set last point timestamp
			self.logger.debug(" + Set sla_lastcalcul to: %s" % last_point[0])
			last_timestamp = last_point[0]
			
			# Store result in perfstore
			# Don't submit Canopsis event because data it's just for next calcul

			for state in states_sum:
				metric_name = 'cps_time_by_state_%s' % state
				self.manager.push(	name="%ssla%s" % (name,metric_name),
									value=states_sum[state],
									timestamp=last_timestamp,
									meta_data={	 
												'co': name, 
												're': 'sla', 
												'me': metric_name ,
												'unit':'s'}
								)

			meta_id = self.manager.get_meta_id(name="%ssla" % name)
			self.storage.update(_id, {'sla_lastcalcul': last_timestamp, 'sla_node_id': meta_id})
			return meta_id
		else:
			self.logger.debug(" + You must have more points for calcul SLA")
			return None
	
	
	def calcul_state_by_timewindow(self, _id, config, sla_id):
		rk  = self.get_rk(config['name'])
		
		self.logger.debug("Calcul state by timewindow")
		self.logger.debug(" + Get States of %s (%s)" % (_id, rk))

		sla_timewindow = config.get('sla_timewindow', self.default_sla_timewindow) # 1 day
		
		thd_warn_sla_timewindow = config.get('thd_warn_sla_timewindow', self.thd_warn_sla_timewindow)
		thd_crit_sla_timewindow = config.get('thd_crit_sla_timewindow', self.thd_crit_sla_timewindow)
		
		sla_output_tpl = config.get('sla_output_tpl', self.default_sla_output_tpl)
		
		if sla_output_tpl == "":
			sla_output_tpl = self.default_sla_output_tpl
		
		# Prevent empty string
		if not thd_warn_sla_timewindow:
			thd_warn_sla_timewindow = self.thd_warn_sla_timewindow
		if not thd_crit_sla_timewindow:
			thd_crit_sla_timewindow = self.thd_crit_sla_timewindow
			
		thd_warn_sla_timewindow = float(thd_warn_sla_timewindow)
		thd_crit_sla_timewindow = float(thd_crit_sla_timewindow)
		
		#consider unknown time
		sla_timewindow_doUnknown = config.get('sla_timewindow_doUnknown', True)

		stop = int(time.time())
		start = stop - sla_timewindow
		
		self.logger.debug(" + output TPL:      %s" % sla_output_tpl)
		self.logger.debug(" + Thd Warning:     %s" % thd_warn_sla_timewindow)
		self.logger.debug(" + Thd Critical:    %s" % thd_crit_sla_timewindow)
		self.logger.debug(" + do Unknown:      %s" % sla_timewindow_doUnknown)
		self.logger.debug(" + sla_timewindow:  %s" % sla_timewindow)
		self.logger.debug(" + start:           %s" % start)
		self.logger.debug(" + stop:            %s" % stop)
		
		## TODO: Tweaks
		total = 0
		states_sum = states.copy()
		first_timestamp = None
		first_interval = 0
		
		for state in states:
			self.logger.debug("Get %s (%s) time's:" % (states_str[state], state))

			metric_name = "%sslacps_time_by_state_%s" % (config['name'],state)
			try:
				points = self.manager.get_points(	name=metric_name,
												tstart=start,
												tstop=stop,
												raw=True
											)
			except:
				self.logger.debug(" + Wait points ...")
				return
				
			nb_points = len(points)
			self.logger.debug(" + %s points" % nb_points)
			
			if nb_points:
				first_timestamp = points[0][0]
				first_interval += points[0][1]
				if nb_points > 1:
					last_timestamp = points[nb_points-1][0]
				else:
					last_timestamp = first_timestamp
				
				self.logger.debug(" + First timestamp: %s" % first_timestamp)
				self.logger.debug(" + Last timestamp:  %s" % last_timestamp)
				
				#if (first_timestamp - points[0][1]) < start:
				#	del points[0]
					
				#if last_timestamp > stop:
				#	del points[nb_points-1]
				
				mysum = sum([point[1] for point in points])				
				states_sum[state] = mysum
				total += mysum
				
				self.logger.debug(" + %s seconds" % states_sum[state])
		
		if first_timestamp and sla_timewindow_doUnknown:
			self.logger.debug("Check Unknown time's:")
			first_interval
			self.logger.debug(" + First interval: %s" % first_interval)
			self.logger.debug(" + Start: %s" % start)
			delta = first_timestamp - start
			self.logger.debug(" + Delta between first_timestamp and start: %s seconds" % delta)
			if delta > 0:
				self.logger.debug("   + Set Unknown time")
				states_sum[3] += delta - first_interval
				total += delta
		
		self.logger.debug("Total: %s seconds" % total)
		
		## Calcul PCT
		perf_data_array = []
		output_data = {}
		states_pct = states.copy()
		for state in states:
			states_pct[state] = 0
			if states_sum[state] > 0:
				states_pct[state] = round((states_sum[state] * 100) / float(total), 3)
			
			metric = 'cps_pct_by_state_%s' % state
			output_data[metric] = states_pct[state]
			perf_data_array.append({"metric": metric, "value": states_pct[state], "max": 100, "unit": "%"})
		
		# Fill template
		output = sla_output_tpl
		if output_data:
			for key in output_data:
				output = output.replace("{%s}" % key, str(output_data[key]))
				
		self.logger.debug(" + output: %s" % output)
		
		state = 0
		if states_pct[0] < thd_warn_sla_timewindow:
			state = 1
		if states_pct[0] < thd_crit_sla_timewindow:
			state = 2
		
		self.logger.debug(" + State: %s (%s)" % (states_str[state], state))
		
		# Send event
		event = cevent.forger(
			connector = "sla",
			connector_name = "engine",
			event_type = "sla",
			source_type="resource",
			component=config['name'],
			resource="sla",
			state=state,
			state_type=1,
			output=output,
			long_output="",
			perf_data=None,
			perf_data_array=perf_data_array
		)
		event['selector_id'] = config['_id']
		event['selector_rk'] = config['rk']
		self.logger.debug("Publish event on %s" % rk)
		self.amqp.publish(event, rk, self.amqp.exchange_name_events)
		
		self.storage.update(_id, {'sla_timewindow_lastcalcul': stop, 'sla_timewindow_perfdata': perf_data_array, 'sla_state': event['state']})
	
	def beat(self):
		start = time.time()
		error = False

		########## calcul_time_by_state
		configs = {}
		records = self.storage.find({ 'crecord_type': 'selector',  'enable': True, 'dosla': {'$in': [ True, 'on'] }, 'dostate': {'$in': [ True, 'on'] }, 'rk': { '$exists' : True } }, namespace="object")
		for record in records:
			configs[record._id] = record.data
			configs[record._id]['name'] = record.name
			configs[record._id]['_id'] =record._id
		
		for _id in configs:
			sla_id = self.calcul_time_by_state(_id, configs[_id])
			self.counter_event += 1
			
			if sla_id:
				########## calcul_state_by_timewindow
				self.calcul_state_by_timewindow(_id, configs[_id], sla_id)
				self.counter_event += 1
				
		self.counter_worktime += time.time() - start

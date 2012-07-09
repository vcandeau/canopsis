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

import multiprocessing
import time
import Queue
import logging
import os, sys
from cinit import cinit
import traceback
import cevent

class cengine(multiprocessing.Process):

	def __init__(self, next_amqp_queue=None, name="worker1", beat_interval=60, logging_level=logging.INFO):
		
		multiprocessing.Process.__init__(self)
		
		self.logging_level = logging_level
	
		self.signal_queue = multiprocessing.Queue()
		self.RUN = True
		
		self.name = name
		
		self.amqp_queue = "Engine_%s" % name
		self.next_amqp_queue = next_amqp_queue
		
		init 	= cinit()
		self.logger = init.getLogger(name, logging_level=self.logging_level)
		
		self.counter_error = 0
		self.counter_event = 0
		self.counter_worktime = 0
		
		self.beat_interval = beat_interval
		self.beat_last = time.time()
		
		self.create_queue =  True
		
		self.send_stats_event = True
				
		self.logger.info("Engine initialised")
		
	def create_amqp_queue(self):
		self.amqp.add_queue(self.amqp_queue, None, self._work, "amq.direct", auto_delete=True)
	
	def pre_run(self):
		pass
		
	def post_run(self):
		pass
	
	def run(self):
		def ready():
			self.logger.info(" + Ready!")
			
		self.logger.info("Start Engine with pid %s" % (os.getpid()))
		
		from camqp import camqp
		
		self.amqp = camqp(logging_level=logging.INFO, logging_name="%s-amqp" % self.name, on_ready=ready)
		
		if self.create_queue:
			self.create_amqp_queue()
		
		self.amqp.start()
		
		self.pre_run()
		
		while self.RUN:
			try:
				# Beat
				if self.beat_interval:
					now = time.time()
					if now > (self.beat_last + self.beat_interval):
						self._beat()						
						self.beat_last = now
					
				# Get signal
				signal = self.signal_queue.get_nowait()
				self.logger.debug("Signal: %s" % signal)
				if signal == "STOP":
					self.RUN = False
			except Queue.Empty:
				pass
			
			time.sleep(0.5)
		
		self.post_run()
		
		self.logger.info("Stop Engine")
		self.stop()
		self.logger.info("End of Engine")
	
	def _work(self, event, *args, **kargs):
		start = time.time()
		error = False
		try:
			wevent = self.work(event, *args, **kargs)
			# Forward event to next queue
			if self.next_amqp_queue:
				if wevent:
					self.logger.debug("Forward event '%s' to next engine '%s'" % (wevent['rk'], self.next_amqp_queue))
					self.amqp.publish(wevent, self.next_amqp_queue, "amq.direct")
				else:
					self.logger.debug("Forward original event '%s' to next engine '%s'" % (event['rk'], self.next_amqp_queue))
					self.amqp.publish(event, self.next_amqp_queue, "amq.direct")
					
		except Exception, err:
			error = True
			self.logger.error("Worker raise exception: %s" % err)
			traceback.print_exc(file=sys.stdout)
	
		if error:
			self.counter_error +=1
			
		self.counter_event += 1
		self.counter_worktime += time.time() - start
		
	def work(self, event, amqp_msg):
		return event
		
	def _beat(self):
		self.logger.debug("Beat: %s event(s), %s error" % (self.counter_event, self.counter_error))
		evt_per_sec = 0
		sec_per_evt = 0
		
		if self.counter_event:
			evt_per_sec = float(self.counter_event) / self.beat_interval
			self.logger.debug(" + %0.2f event(s)/seconds" % evt_per_sec)
			
		if self.counter_worktime:
			sec_per_evt = self.counter_worktime / self.counter_event
			self.logger.debug(" + %0.5f seconds/event" % sec_per_evt)
			
		self.counter_error = 0
		self.counter_event = 0
		self.counter_worktime = 0
		
		## Submit event
		if self.send_stats_event:
			state = 0
			
			if sec_per_evt > 0.5:
				state = 1
				
			if sec_per_evt > 0.8:
				state = 2
			
			perf_data_array = [
				{'metric': 'cps_evt_per_sec', 'value': round(evt_per_sec,2), 'unit': 'evt/sec' },
				{'metric': 'cps_sec_per_evt', 'value': round(sec_per_evt,5), 'unit': 'sec/evt', 'warn': 0.5, 'crit': 0.8 },
			]
			
			event = cevent.forger(
				connector = "cengine",
				connector_name = "engine",
				event_type = "check",
				source_type="resource",
				resource=self.amqp_queue,
				state=state,
				state_type=1,
				output="%0.2f evt/sec, %0.5f sec/evt" % (evt_per_sec, sec_per_evt),
				perf_data_array=perf_data_array
			)
			
			rk = cevent.get_routingkey(event)
			self.amqp.publish(event, rk, self.amqp.exchange_name_events)
		
		try:
			self.beat()
		except Exception, err:
			self.logger.error("Beat raise exception: %s" % err)
			traceback.print_exc(file=sys.stdout)
				
	def beat(self):
		pass
			
	def stop(self):
		self.RUN = False
		self.amqp.stop()
		self.amqp.join()
		self.signal_queue.empty()
		del self.signal_queue
		self.logger.debug(" + Stopped")

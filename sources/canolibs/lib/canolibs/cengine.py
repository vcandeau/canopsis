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

from camqp import camqp
import multiprocessing
import time
import Queue
import logging
import os
from cinit import cinit

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
		
		self.amqp = camqp(logging_level=logging.INFO)
		self.amqp.add_queue(self.amqp_queue, None, self._work, "amq.direct", auto_delete=True)
		
		self.counter_error = 0
		self.counter_event = 0
		self.counter_worktime = 0
		
		self.beat_interval = beat_interval
		self.beat_last = time.time()
				
		self.logger.info("Engine initialised with pid %s" % (os.getpid()))

	def run(self):
		self.logger.info("Start Engine")
			
		self.amqp.start()
		
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
				self.logger.debug("Send event to next engine '%s'" % self.next_amqp_queue)
				if wevent:
					self.amqp.publish(wevent, self.next_amqp_queue, "amq.direct")
				else:
					self.logger.warning("forward with original event")
					self.amqp.publish(event, self.next_amqp_queue, "amq.direct")
					
		except Exception, err:
			error = True
			self.logger.error("Worker raise exception: %s" % err)
	
		if error:
			self.counter_error +=1
			
		self.counter_event += 1
		self.counter_worktime += time.time() - start
		
	def work(self, event, amqp_msg):
		return event
		
	def _beat(self):
		self.logger.debug("Beat: %s event(s), %s error" % (self.counter_event, self.counter_error))
		if self.counter_event:
			self.logger.debug(" + %0.2f event(s)/seconds" % (float(self.counter_event) / self.beat_interval))
			
		if self.counter_worktime:
			self.logger.debug(" + %0.5f seconds/event" % (self.counter_worktime / self.counter_event))
			
		self.counter_error = 0
		self.counter_event = 0
		self.counter_worktime = 0
		
		try:
			self.beat()
		except Exception, err:
			self.logger.error("Beat raise exception: %s" % err)
				
	def beat(self):
		pass
			
	def stop(self):
		self.RUN = False
		self.amqp.stop()
		self.amqp.join()
		self.signal_queue.empty()
		del self.signal_queue
		self.logger.debug(" + Stopped")

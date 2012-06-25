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


import unittest
import time, json, logging
from multiprocessing import Process

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )


from camqp import camqp
from cinit import cinit

############""

from camqp import camqp
import multiprocessing
import time
import Queue
from cinit import cinit

class Engine(multiprocessing.Process):

	def __init__(self, signal_queue, name="worker1"):
		multiprocessing.Process.__init__(self)
	
		self.signal_queue = signal_queue
		self.RUN = True
		
		self.name = name
		self.amqp_queue = "Engine_%s" % name
		
		init 	= cinit()
		self.logger = init.getLogger(name, level="DEBUG")
		
		self.amqp = camqp()
		self.amqp.add_queue(self.amqp_queue, None, self.work, "amq.direct", auto_delete=True)
		
		self.logger.debug("Engine initialised")

	def run(self):
		self.logger.debug("Run Engine")
		self.amqp.start()
		
		while self.RUN:
			try:
				signal = self.signal_queue.get_nowait()
				self.logger.debug("Signal: %s" % signal)
				if signal == "STOP":
					self.RUN = False
			except Queue.Empty:
				pass
			
			time.sleep(0.5)
			
		self.logger.debug("Stop Engine")
		self.stop()
		
	def work(self, body, msg):
		self.logger.debug("Event: %s" % body)
			
	def stop(self):
		self.RUN = False
		self.amqp.stop()
		self.amqp.join()
		self.logger.debug(" + Stopped")
	
##################


DAEMON_NAME="amqp2engines"

init 	= cinit()
#logger 	= init.getLogger(DAEMON_NAME, level="DEBUG")
logger 	= init.getLogger(DAEMON_NAME)
handler = init.getHandler(logger)

engines=[]
engine = None
amqp = None

def on_message(body, msg):
	amqp.publish(body, engine.amqp_queue, "amqp.direct")
	
def main():
	global engine, amqp
		
	logger.info("Initialyze process")
	handler.run()
	
	# Init Engines
	signal_queue = multiprocessing.Queue()
	engine = Engine(signal_queue)
	
	# Init AMQP
	amqp = camqp()
	amqp.add_queue(DAEMON_NAME, ['#'], on_message, amqp.exchange_name_events, auto_delete=False)	
	
	# Start Engines
	engine.start()
	
	# Start AMQP
	amqp.start()
	
	logger.info("Wait")
	handler.wait()
	
	# Stop Engines
	signal_queue.put("STOP")
	engine.join()
	
	# Stop AMQP
	amqp.stop()
	amqp.join()
	
	signal_queue.empty()
	logger.info("Process finished")
	
if __name__ == "__main__":
	main()

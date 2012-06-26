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
import multiprocessing
from multiprocessing import Process

from camqp import camqp
from cinit import cinit

## Engines path
import sys, os
sys.path.append(os.path.expanduser('~/opt/amqp2engines/engines/'))

import perfstore
import eventstore

## Configurations

DAEMON_NAME="amqp2engines"

init 	= cinit()
#logger 	= init.getLogger(DAEMON_NAME, level="DEBUG")
logger 	= init.getLogger(DAEMON_NAME)
handler = init.getHandler(logger)

engines=[]
engine = None
amqp = None
next_queue = []

def on_message(body, msg):
	## Sanity Checks
	rk = msg.delivery_info['routing_key']
	if not rk:
		raise Exception("Invalid routing-key '%s' (%s)" % (rk, body))
		
	#logger.debug("Event: %s" % rk)
	
	## Try to decode event
	if isinstance(body, dict):
		event = body
	else:
		logger.info(" + Try to decode event '%s'" % rk)
		try:
			if isinstance(body, str) or isinstance(body, unicode):
				try:
					event = json.loads(body)
				except:
					try:
						logger.info(" + Try hack for windows string")
						# Hack for windows FS -_-
						event = json.loads(body.replace('\\', '\\\\'))
					except Exception, err:
						raise Exception(err)
		except Exception, err:
			logger.info("   + Failed")
			logger.debug("Impossible to parse event '%s'" % rk)
			logger.debug(body)
			raise Exception("Impossible to parse event '%s'" % rk)
	
	## Forward to engines
	event['rk'] = rk
	
	for queue in next_queue:
		amqp.publish(event, queue, "amq.direct")
	
def main():
	global engine, amqp
		
	logger.info("Initialyze process")
	handler.run()
	
	# Init Engines
	engine_eventstore = eventstore.engine()
	engine_perfstore = perfstore.engine(next_amqp_queue=engine_eventstore.amqp_queue)
	
	# Set Next queue
	next_queue.append(engine_perfstore.amqp_queue)
	
	### perfstore -> eventstore
	
	# Init AMQP
	amqp = camqp()
	amqp.add_queue(DAEMON_NAME, ['#'], on_message, amqp.exchange_name_events, auto_delete=False)	
	
	# Start Engines
	engine_perfstore.start()
	engine_eventstore.start()
	
	# Start AMQP
	amqp.start()
	
	logger.info("Wait")
	handler.wait()
	
	# Stop Engines
	engine_perfstore.signal_queue.put("STOP")
	engine_eventstore.signal_queue.put("STOP")
	
	engine_perfstore.join()
	engine_eventstore.join()
	
	# Stop AMQP
	amqp.stop()
	amqp.join()

	logger.info("Process finished")
	
if __name__ == "__main__":
	main()

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

from camqp import camqp
from cinit import cinit

## Engines path
import sys, os
sys.path.append(os.path.expanduser('~/opt/amqp2engines/engines/'))

## Configurations

DAEMON_NAME="amqp2engines"

init 	= cinit()
#logger 	= init.getLogger(DAEMON_NAME, level="DEBUG")
logger 	= init.getLogger(DAEMON_NAME)
handler = init.getHandler(logger)

engines=[]
amqp = None
next_event_engines = []
next_alert_engines = []
ready = False

def clean_message(body, msg):
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
	
	event['rk'] = rk
	return event
	
def wait_engine():
	if not ready:
		while ready:
			time.sleep(0.5)
	

def on_event(body, msg):
	# Wait engine
	wait_engine()
		
	## Clean message	
	event = clean_message(body, msg)
	
	event['exchange'] = amqp.exchange_name_events
	
	## Forward to engines
	for engine in next_event_engines:
		try:
			engine.input_queue.put(event)
		except Queue.Full:
			logger.warngin("Internal queue of '%s' is full, forward event to AMQP queue." % engine.name)
			amqp.publish(event, engine.amqp_queue, "amq.direct")

	
def on_alert(body, msg):
	# Wait engine
	wait_engine()
	
	## Clean message	
	event = clean_message(body, msg)
	
	event['exchange'] = amqp.exchange_name_alerts
	
	## Forward to engines
	for engine in next_alert_engines:
		try:
			engine.input_queue.put(event)
		except Queue.Full:
			logger.warngin("Internal queue of '%s' is full, forward event to AMQP queue." % engine.name)
			amqp.publish(event, engine.amqp_queue, "amq.direct")

def start_engines():
	global engines
	# Init Engines
	## TODO: Use routing table for dynamic routing
	### Route:
	
	# Events:
	### Nagios/Icinga/Shinken... ----------------------------> canopsis.events -> tag -> perfstore -> eventstore
	### collectd ------------------> amq.topic -> collectdgw |
	
	# Alerts:
	### canopsis.alerts -> selector -> eventstore
	
	import perfstore
	import eventstore
	import collectdgw
	import tag
	import selector
	import sla
	
	engine_selector		= selector.engine(logging_level=logging.INFO)
	engines.append(engine_selector)
	
	engine_collectdgw	= collectdgw.engine()
	engines.append(engine_collectdgw)
	
	engine_eventstore	= eventstore.engine()
	engines.append(engine_eventstore)
	
	engine_perfstore	= perfstore.engine(	next_engines=[engine_eventstore])
	engines.append(engine_perfstore)
	
	engine_tag			= tag.engine(		next_engines=[engine_perfstore])
	#engine_tag			= tag.engine(		next_engines=[engine_eventstore])
	engines.append(engine_tag)
	
	engine_sla			= sla.engine(logging_level=logging.INFO)
	engines.append(engine_sla)

	# Set Next queue
	## Events
	next_event_engines.append(engine_tag)
	## Alerts
	next_alert_engines.append(engine_selector)
	
	logger.info("Start engines")
	for engine in engines:
		engine.start()
	
def stop_engines():
	logger.info("Stop engines")
	for engine in engines:
		engine.signal_queue.put("STOP")
	
	logger.info("Join engines")
	for engine in engines:
		engine.join()
		while engine.is_alive():
			time.sleep(0.1)
			
	time.sleep(0.5)

def amqp2engines_ready():
	start_engines()

def main():
	global amqp, ready
		
	logger.info("Initialyze process")
	handler.run()
	
	# Init AMQP
	amqp = camqp(on_ready=amqp2engines_ready, logging_name="%s-amqp" % DAEMON_NAME)
	amqp.add_queue(DAEMON_NAME, ['#'], on_event, amqp.exchange_name_events, auto_delete=False)
	amqp.add_queue("%s_alerts" % DAEMON_NAME, ['#'], on_alert, amqp.exchange_name_alerts, auto_delete=False)
	
	# Start AMQP
	amqp.start()
	
	# Safety wait
	time.sleep(3)
	ready = True
	
	logger.info("Wait")
	handler.wait()
	
	# Stop AMQP
	amqp.stop()
	amqp.join()
	
	stop_engines()

	logger.info("Process finished")
	
if __name__ == "__main__":
	main()

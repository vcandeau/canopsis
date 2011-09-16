#!/usr/bin/env python

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content

from pymongo import Connection
import json

from cstorage import cstorage
from crecord import crecord
from caccount import caccount
from cselector import cselector
from csla import csla

from twisted.internet import reactor, task

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "sla2mongodb"
DAEMON_TYPE = "engine"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)
myamqp = None

DEFAULT_ACCOUNT = caccount(user="root", group="root")

SLAS = []
SLA_LASTUPDATE = 0
SLA_RTIME = 300

SELS = []
SEL_LASTUPDATE = 0
SEL_RTIME = 300

########################################################
#
#   Callback
#
########################################################
	
def on_message(msg):
	global SLA_CHANGE
	_id = msg.routing_key

 	event = json.loads(msg.content.body)
	
	# Create record
	record = crecord(event)
	record.type = "event"
	record._id = _id
	
	## Calcul availability for each selector
	selectors = get_selectors(_id)
	if selectors:
		#logger.debug(str(len(selectors)) + " selector(s) match for _id '"+_id+"' ...")
		for selector in selectors:
			#logger.debug(" + Calcul availability for "+selector.name)
			selector.get_current_availability()

			# Publish selector event
			event = selector.dump_event()
			msg = Content(json.dumps(event))
			amqp.publish(msg, event['rk'], amqp.exchange_name_liveevents)


########################################################
#
#   Functions
#
########################################################


#### Connect signals
RUN = 1
import signal
def signal_handler(signum, frame):
	logger.warning("Receive signal to stop daemon...")
	global RUN
	RUN = 0
 

def get_selectors(_id):
	global SEL_LASTUPDATE, SELS
	
	now = time.time()
	
	if (SEL_LASTUPDATE + SEL_RTIME) <= now:
		logger.debug("Refresh Selector list ...")
		SELS = []
		SEL_LASTUPDATE = now
		records = storage.find({'crecord_type': 'selector'})
		for record in records:
			selector = cselector(storage=storage, record=record, logging_level=logging.DEBUG)
			SELS.append(selector)

	## Find selector
	selectors = []
	for sel in SELS:
		if sel.match(_id):
			selectors.append(sel)

	return selectors
		
			

def calcul_all_sla():	
	global SLA_LASTUPDATE, SLAS
	
	now = time.time()
	
	if (SLA_LASTUPDATE + SLA_RTIME) <= now:
		logger.debug("Refresh SLA list ...")
		SLAS = []
		SLA_LASTUPDATE = now
		records = storage.find({'crecord_type': 'sla', 'active': True})
		for record in records:
			sla = csla(storage=storage, record=record, logging_level=logging.DEBUG)
			SLAS.append(sla)
	
	logger.debug("Launch calculs on all SLA")
	for sla in SLAS:
		logger.debug(" + Start on "+sla._id)
		sla.get_sla()
		
		# Publish selector event
		event = sla.dump_event()
		msg = Content(json.dumps(event))
		amqp.publish(msg, event['rk'], amqp.exchange_name_liveevents)

	logger.debug(" + End of calculs")
			

########################################################
#
#   Main
#
########################################################

amqp=None
storage=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, storage

	storage = cstorage(DEFAULT_ACCOUNT, namespace='object', logging_level=logging.INFO)

	## Tasks
	slaTask = task.LoopingCall(calcul_all_sla)

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['eventsource.#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()
	
	time.sleep(1)

	## Refresh SLA list all 5 minutes
	slaTask.start(60)

	while RUN:
		time.sleep(1)

	try:
		slaTask.stop()
	except:
		pass

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

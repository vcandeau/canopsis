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
from csla import csla

from threading import Lock

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

SLA_CHANGE = {}
SLAS = []
LOCK = Lock()

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

	LOCK.acquire(True)
	for sla in SLAS:
		if sla.selector.match(_id):
			SLA_CHANGE[sla._id] = True
	LOCK.release()


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
 

## get sla
def get_all_sla():
	global SLA_CHANGE, SLAS
	LOCK.acquire(True)
	logger.debug("Get all SLA ...")

	SLA_CHANGE = {}
	SLAS = []
	records = storage.find({'crecord_type': 'sla', 'active': True})
	for record in records:
		sla = csla(storage=storage, record=record, logging_level=logging.DEBUG)
		if sla.active:
			SLA_CHANGE[sla._id] = False
			SLAS.append(sla)

	logger.debug(" + Load %s SLA" % len(SLAS))
	LOCK.release()
	
def calcul_all_sla():
	global SLA_CHANGE
	LOCK.acquire(True)
	logger.debug("Launch calculs on all SLA")
	for sla in SLAS:
		logger.debug(" + Start on "+sla._id)
		sla.get_sla()
		if SLA_CHANGE[sla._id]:
			SLA_CHANGE[sla._id] = False
			#sla.get_current_availability()

	logger.debug(" + End of calculs")
	LOCK.release()
			

########################################################
#
#   Main
#
########################################################

amqp=None
storage=None
slas = None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global slas, amqp, storage

	storage = cstorage(DEFAULT_ACCOUNT, namespace='object', logging_level=logging.INFO)

	## Tasks
	gaslaTask = task.LoopingCall(get_all_sla)
	calTask = task.LoopingCall(calcul_all_sla)

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['eventsource.#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()
	
	time.sleep(2)

	## Refresh SLA list all 5 minutes
	gaslaTask.start(300)
	## Calcul SLA all minutes
	calTask.start(60)

	while RUN:
		time.sleep(1)

	try:
		calTask.stop()
	except:
		pass

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

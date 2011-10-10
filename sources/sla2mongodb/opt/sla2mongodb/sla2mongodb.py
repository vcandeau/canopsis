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

SLA_RTIME = 300
SEL_RTIME = 300

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
 

def calcul_all_availability():
	
	logger.debug("Refresh Selector list ...")
	SELS = []
	records = storage.find({'crecord_type': 'selector'})
	for record in records:
		selector = cselector(storage=storage, record=record, logging_level=logging.DEBUG)
		SELS.append(selector)


	logger.debug("Launch calculs on all Selector")
	for sel in SELS:
		logger.debug(" + Calcul availability for "+sel.name)
		sel.get_current_availability()

		# Publish selector event
		event = sel.make_event()
		msg = Content(json.dumps(event))
		amqp.publish(msg, event['rk'], amqp.exchange_name_liveevents)

	logger.debug(" + End of calculs")
		
			

def calcul_all_sla():	

	logger.debug("Refresh SLA list ...")
	SLAS = []
	records = storage.find({'crecord_type': 'sla', 'active': True})
	for record in records:
		sla = csla(storage=storage, record=record, logging_level=logging.DEBUG)
		SLAS.append(sla)
	
	logger.debug("Launch calculs on all SLA")
	for sla in SLAS:
		logger.debug(" + Calcul sla for "+sla._id)
		sla.get_sla()
		
		# Publish sla event
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
	avaTask = task.LoopingCall(calcul_all_availability)

	# AMQP
	amqp = camqp()
	amqp.start()

	## Refresh SLA list all 5 minutes
	slaTask.start(SLA_RTIME)
	avaTask.start(SEL_RTIME)

	while RUN:
		time.sleep(1)

	slaTask.stop()
	avaTask.stop()

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

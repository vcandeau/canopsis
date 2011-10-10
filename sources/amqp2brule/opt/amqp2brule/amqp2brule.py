#!/usr/bin/env python

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content
from twisted.internet import task

from pymongo import Connection
import json

from cstorage import cstorage
from crecord import crecord
from caccount import caccount

from cbrule import cbrule

from ctools import parse_perfdata

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2brule"
DAEMON_TYPE = "rulesengine"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)
myamqp = None
bussiness_rules  = None

DEFAULT_ACCOUNT = caccount(user="root", group="root")
BRULE_RTIME = 300

bussiness_rules_loaded = {}

########################################################
#
#   Callback
#
########################################################
	
def on_message(msg):
	_id = msg.routing_key

 	event = json.loads(msg.content.body)

	#logger.debug("Push event for "+_id)
	for key in bussiness_rules.keys():
		bussiness_rules[key].push_event(_id, event)


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
 

def init_bussiness_rules():
	global bussiness_rules

	logger.debug("Load all bussiness rules ...")
	tmp = {}
	
	records = storage.find({'crecord_type': 'brule'}, namespace='object')

	for record in records:
		try:
			if bussiness_rules_loaded[record._id] != record.write_time:
				logger.debug(" + Reload '%s'" % record._id)
				tmp[record._id] = cbrule(record.name, storage=storage, amqp=amqp)
				bussiness_rules_loaded[record._id] = record.write_time
			else:
				tmp[record._id] = bussiness_rules[record._id]
				
		except:
			logger.debug(" + Load '%s'" % record._id)
			bussiness_rules_loaded[record._id] = record.write_time
			tmp[record._id] = cbrule(record.name, storage=storage, amqp=amqp)
			

	bussiness_rules = tmp


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
	global amqp, storage, bussiness_rules 

	storage = cstorage(DEFAULT_ACCOUNT, namespace='object', logging_level=logging.INFO)

	# Rules Engine
	bruleTask = task.LoopingCall(init_bussiness_rules)

	# AMQP
	amqp = camqp(logging_level=logging.INFO)

	amqp.add_queue(DAEMON_NAME, ['eventsource.#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()

	bruleTask.start(BRULE_RTIME)

	while RUN:
		time.sleep(1)

	bruleTask.stop()
	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

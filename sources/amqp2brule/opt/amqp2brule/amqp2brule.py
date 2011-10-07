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

########################################################
#
#   Callback
#
########################################################
	
def on_message(msg):
	_id = msg.routing_key

 	event = json.loads(msg.content.body)

	#logger.debug("Push event for "+_id)
	for bussiness_rule in bussiness_rules:
		bussiness_rule.push_event(_id, event)

	# Create record
	#record = crecord(event)
	#record.type = "event"
	#record.chmod("o+r")
	#record._id = rk


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

	storage = cstorage(DEFAULT_ACCOUNT, namespace='inventory', logging_level=logging.INFO)

	# Rules Engine

	#myrule1 = cbrule(name='myrule1', ids=['eventsource.nagios.Central.check.service.olivier.HTTP', 'eventsource.nagios.Central.check.service.william.HTTP', 'eventsource.nagios.Central.check.service.olivier.SSH'])

	#myrule1 = cbrule(name='myrule2', selector='selector-root-all-services')
	myrule1 = cbrule(name='myrule2', ids=[ 'eventsource.nagios.Central.check.service.william.HTTP', 'eventsource.nagios.Central.check.service.william.SSH' ])
	#myrule1.add_check('check_state')
	crit_binrule = { 'and': [
		{'id|state|eventsource.nagios.Central.check.service.william.HTTP': 2},
		{'id|state|eventsource.nagios.Central.check.service.william.SSH': 2},
	] }

	warn_binrule = { 'or': [
		{'id|state|eventsource.nagios.Central.check.service.william.HTTP': 2},
		{'id|state|eventsource.nagios.Central.check.service.william.SSH': 2},
	] }

	myrule1.add_check('check_binarierule', {'warn_rule': warn_binrule, 'crit_rule': crit_binrule })

	#eventsource.nagios.Central.check.service.olivier.SSH

	bussiness_rules = [myrule1]

	# AMQP
	amqp = camqp(logging_level=logging.INFO)

	amqp.add_queue(DAEMON_NAME, ['eventsource.#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

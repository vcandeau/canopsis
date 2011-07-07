#!/usr/bin/env python

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content

from pymongo import Connection
import json

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2mongodb"
DAEMON_TYPE = "storage"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)
myamqp = None

########################################################
#
#   Callback
#
########################################################
	
def on_message(msg):
	rk = msg.routing_key
	
 	event = json.loads(msg.content.body)

	publish_changed_event(rk, event)

	store_event(rk, event)


def publish_changed_event(_id, event):
	(last_state, last_state_type) = get_last_state(_id)
	state = event['state']
	state_type = event['state_type']
	if state != last_state or state_type != last_state_type:
		msg = Content(json.dumps(event))
		amqp.publish(msg, _id, amqp.exchange_name_changed)
			

def store_event(_id, event):
	minventory.update({'_id': _id}, {"$set": event}, upsert=True, safe=True)

def get_last_state(_id):
        state = minventory.find_one({'_id': _id}, {'state':1, 'state_type': 1})
        return ( state['state'], state['state_type'])

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

minventory=None
amqp=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, minventory

	# MongoDB
	mconn = Connection('localhost', 27017)
	mdb = mconn['canopsis']
	minventory = mdb['inventory']

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['eventsource.#.check.#'], on_message)
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

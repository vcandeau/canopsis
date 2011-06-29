#!/usr/bin/env python

import time
import logging

from camqp import camqp, files_preserve

from pymongo import Connection
import json

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2mongodb"
DAEMON_TYPE = "logger"

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
	id = msg.delivery_info['routing_key']

	body = json.loads(msg.body)
	#body['_id'] = id

	minventory.update({'_id': id}, {"$set": body}, upsert=True)

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
	## Stop amqp
	if myamqp:
		myamqp.disconnect()
 
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


########################################################
#
#   Main
#
########################################################

minventory=None
amqp=None

def main():
	global amqp, minventory
	
	# MongoDB
	mconn = Connection('localhost', 27017)
	mdb = mconn['canopsis']
	minventory = mdb['inventory']

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, '#', on_message)
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

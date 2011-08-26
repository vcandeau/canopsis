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

DEFAULT_ACCOUNT = caccount(user="root", group="root")

########################################################
#
#   Callback
#
########################################################
	
def on_message(msg):
	rk = msg.routing_key

 	event = json.loads(msg.content.body)
	
	# Create record
	record = crecord(event)
	record.type = "event"
	record.chmod("o+r")
	record._id = rk

	# Check if state is change
	try:
		oldrecord = storage_inventory.get(rk)
		
		state = event['state']
		state_type = event['state_type']

		oldstate = oldrecord.data['state']
		oldstate_type = oldrecord.data['state_type']

		if state != oldstate or state_type != oldstate_type:
			publish_changed_event(record)

	except KeyError:
		publish_changed_event(record)

	except Exception, err:
		logger.error(err)
	

	# Put record
	storage_inventory.put(record)

def publish_changed_event(record):
	_id = record._id
	hrecord = crecord(raw_record=record.dump())

	hrecord._id = _id+"-"+str(record.data['timestamp'])
	hrecord.data['inventory_id'] = _id

	logger.debug("State of '%s' change ..." % _id)
	storage_history.put(hrecord)

	msg = Content(json.dumps(record.data))
	amqp.publish(msg, _id, amqp.exchange_name_events)

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
storage_inventory=None
storage_history=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, storage_inventory, storage_history

	storage_inventory = cstorage(DEFAULT_ACCOUNT, namespace='inventory', logging_level=logging.INFO)
	storage_history = cstorage(DEFAULT_ACCOUNT, namespace='history', logging_level=logging.INFO)

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['eventsource.#.check.#'], on_message, amqp.exchange_name_liveevents)
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

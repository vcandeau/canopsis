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

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content

from pymongo import Connection
import json

from cstorage import cstorage
from crecord import crecord
from caccount import caccount

from ctools import parse_perfdata

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
		oldrecord = storage.get(rk, namespace='inventory')
		
		state = event['state']
		state_type = event['state_type']

		oldstate = oldrecord.data['state']
		oldstate_type = oldrecord.data['state_type']

		if state != oldstate or state_type != oldstate_type:
			record.data['previous_state'] = oldstate
			publish_changed_event(record)

	except KeyError:
		record.data['previous_state'] = record.data['state']
		publish_changed_event(record)

	except Exception, err:
		logger.error(err)
	
	perf_data = event['perf_data']
	if perf_data != "":
		record.data['perf_data_array'] = parse_perfdata(perf_data)


	# Put record
	storage.put(record, namespace='inventory')

def publish_changed_event(record):
	_id = record._id
	hrecord = crecord(raw_record=record.dump())

	hrecord._id = _id+"-"+str(record.data['timestamp'])
	hrecord.data['inventory_id'] = _id

	logger.debug("State of '%s' change ..." % _id)
	storage.put(hrecord, namespace='history')

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
storage=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, storage

	storage = cstorage(DEFAULT_ACCOUNT, namespace='inventory', logging_level=logging.INFO)

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['#.check.#'], on_message, amqp.exchange_name_liveevents)
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

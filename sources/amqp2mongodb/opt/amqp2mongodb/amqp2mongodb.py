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

from carchiver import carchiver

from ctools import parse_perfdata

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2mongodb"
DAEMON_TYPE = "storage"

logging_level = logging.INFO
logging.basicConfig(level=logging_level,
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
	event_id = msg.routing_key
	logger.debug("Check event: %s" % event_id)
	try:
	 	event = json.loads(msg.content.body)
	except:
		logger.error("Impossible to parse event, Dump:\n%s" % msg.content.body)
		raise Exception('Impossible to parse event')

	if   event['event_type'] == 'check' or event['event_type'] == 'clock':

		if archiver.check_event(event_id, event):
			msg = Content(json.dumps(event))
			## Event to Alert
			amqp.publish(msg, event_id, amqp.exchange_name_alerts)

	elif event['event_type'] == 'log':

		## Alert only non-ok state
		if event['state'] != 0:
			archiver.log_event(event_id, event)

			msg = Content(json.dumps(event))
			## Event to Alert
			amqp.publish(msg, event_id, amqp.exchange_name_alerts)

	else:
		logger.warning("Unknown event type '%s', id: '%s', event:\n%s" % (event['event_type'], event_id, event))


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
archiver=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, archiver

	archiver = carchiver(namespace='events',  autolog=True)
	# AMQP
	amqp = camqp(logging_level=logging_level)

	amqp.add_queue(DAEMON_NAME, ['#'], on_message, amqp.exchange_name_events)

	logger.info("Wait events ...")
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

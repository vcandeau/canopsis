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

from cperfstore import cperfstore

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2perfstore"
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
	_id = msg.routing_key

 	event = json.loads(msg.content.body)
	
	perf_data = event['perf_data']
	if perf_data != "":
		#perfstore.put(_id, perf_data, event['timestamp'])
		perfstore.put(_id, perf_data)
	

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
perfstore = None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, storage, perfstore

	storage = cstorage(DEFAULT_ACCOUNT, namespace='inventory', logging_level=logging.INFO)

	perfstore = cperfstore(storage=storage, logging_level=logging.DEBUG)

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

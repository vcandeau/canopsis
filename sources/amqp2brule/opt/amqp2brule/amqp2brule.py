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
business_rules  = None

DEFAULT_ACCOUNT = caccount(user="root", group="root")
BRULE_RTIME = 300

business_rules_loaded = {}

########################################################
#
#   Callback
#
########################################################
	
def on_message(msg):
	_id = msg.routing_key

 	event = json.loads(msg.content.body)

	#logger.debug("Push event for "+_id)
	for key in business_rules.keys():
		business_rules[key].push_event(_id, event)


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
 

def init_business_rules():
	global business_rules

	logger.debug("Load all business rules ...")
	tmp = {}
	
	records = storage.find({'crecord_type': 'brule'}, namespace='object')

	for record in records:
		try:
			if business_rules_loaded[record._id] != record.write_time:
				logger.debug(" + Reload '%s'" % record._id)
				tmp[record._id] = cbrule(name=record.name, storage=storage, amqp=amqp)
				business_rules_loaded[record._id] = record.write_time
			else:
				tmp[record._id] = business_rules[record._id]
				
		except:
			logger.debug(" + Load '%s'" % record._id)
			business_rules_loaded[record._id] = record.write_time
			tmp[record._id] = cbrule(name=record.name, storage=storage, amqp=amqp)
			

	business_rules = tmp


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
	global amqp, storage, business_rules 

	storage = cstorage(DEFAULT_ACCOUNT, namespace='object', logging_level=logging.INFO)

	# Rules Engine
	bruleTask = task.LoopingCall(init_business_rules)

	# AMQP
	amqp = camqp(logging_level=logging.INFO)

	amqp.add_queue(DAEMON_NAME, ['#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()

	bruleTask.start(BRULE_RTIME)

	while RUN:
		time.sleep(1)

	bruleTask.stop()
	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

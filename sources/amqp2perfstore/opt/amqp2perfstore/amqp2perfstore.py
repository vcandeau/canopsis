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

from ctools import parse_perfdata

from pyperfstore import node
from pyperfstore import mongostore

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2perfstore2"
DAEMON_TYPE = "storage"

logging.basicConfig(level=logging.ERROR,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

logger = logging.getLogger(DAEMON_NAME)
myamqp = None

## Pyperfstore
rotate_plan = {
	'PLAIN': 3,
	'TSC': 0,
}

point_per_dca = 30

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
		try:
			perf_data = parse_perfdata(perf_data)
		except:
			raise Exception("Imposible to parse: " + str(perf_data))

		mynode = node(_id, storage=perfstore, point_per_dca=point_per_dca, rotate_plan=rotate_plan)

		#{u'rta': {'min': 0.0, 'metric': u'rta', 'value': 0.097, 'warn': 100.0, 'crit': 500.0, 'unit': u'ms'}, u'pl': {'min': 0.0, 'metric': u'pl', 'value': 0.0, 'warn': 20.0, 'crit': 60.0, 'unit': u'%'}}

		for metric in perf_data.keys():
			value = perf_data[metric]['value']
			timestamp = int(event['timestamp'])
			try:
				unit = str(perf_data[metric]['unit'])
			except:
				unit = None
	
			if int(value) == value:
				value = int(value)
			else:
				value = float(value)
			
			logger.debug(" + Put metric '%s' (%s %s) for ts %s ..." % (metric, value, unit, timestamp))

			mynode.metric_push_value(dn=metric, unit=unit, value=value, timestamp=timestamp)

		#del mynode
			
	

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
perfstore = None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, perfstore

	perfstore = mongostore(mongo_collection='perfdata')

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()

	while RUN:
		time.sleep(1)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

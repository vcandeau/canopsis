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
import datetime
import json

from camqp import camqp, files_preserve
from txamqp.content import Content

from ctimer import ctimer
import cevent

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "clock2amqp"
DAEMON_TYPE = "core"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)


########################################################
#
#   Callback
#
########################################################

def on_timer_task():
	event = cevent.forger(connector='clock', connector_name=DAEMON_NAME, event_type='clock', output=str(int(time.time())) )
	rk = cevent.get_routingkey(event)

	msg = Content(json.dumps(event))
	amqp.publish(msg, rk, amqp.exchange_name_events)

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

	mytimer.stop_task()

	global RUN
	RUN = 0
 


########################################################
#
#   Main
#
########################################################

amqp=None
mytimer=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, RUN, mytimer

	# AMQP
	amqp = camqp()
	amqp.start()

	mytimer = ctimer(logging_level=logging.DEBUG)

	wait = 60 - time.gmtime().tm_sec
	logger.debug("Wait %s seconds ..." % wait)

	while time.gmtime().tm_sec != 0 and RUN:
			if time.gmtime().tm_sec < 55:
				time.sleep(3)
			else:
				time.sleep(0.01)

	if RUN:
		logger.debug(" + Ok let's go !")
		mytimer.start_task(task=on_timer_task, interval=60)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

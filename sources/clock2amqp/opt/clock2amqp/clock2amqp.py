#!/usr/bin/env python

import time
import logging
import datetime
import json

from camqp import camqp, files_preserve
from txamqp.content import Content

from ctimer import ctimer
from ctools import make_event

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
	event = make_event(service_description="Internal Clock", source_name='clock2amqp', source_type="clock", host_name="core", state_type=1, state=0, output=str(int(time.time())))
	msg = Content(json.dumps(event))
	amqp.publish(msg, event['rk'], amqp.exchange_name_liveevents)

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

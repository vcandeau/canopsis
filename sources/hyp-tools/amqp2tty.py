#!/usr/bin/env python
import sys

from stormed import Connection, Message
import time, signal, threading, json, logging
from Queue import *
from amqp import amqp
import json


########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2tty"
DAEMON_TYPE = "logger"

AMQP_HOST = "localhost"
AMQP_QUEUE_NAME = DAEMON_TYPE+"."+DAEMON_NAME


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)


########################################################
#
#   Handler
#
########################################################
		

def amqp_on_message(amqp, msg):
	print "--> %r:" % (msg.rx_data.routing_key)
        print "\t%s\n" % msg.body
	pass


########################################################
#
#   Functions
#
########################################################

RUN = 1
#### Connect signals
def signal_handler(signum, frame):
	logger.warning("Receive signal to stop daemon...")
	global RUN
	RUN = 0
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


########################################################
#
#   RPC Functions
#
########################################################


########################################################
#
#   Main
#
########################################################

thr_amqp = amqp(
	host = AMQP_HOST,
	queue_name = AMQP_QUEUE_NAME,
	routing_keys = [ DAEMON_TYPE+".broadcast", "broadcast" , "#"]
	#logging_level = logging.WARNING,
)

#thr_amqp.fn_worker = amqp_worker
thr_amqp.cb_on_message = amqp_on_message

### Start Main !
thr_amqp.start()

while RUN:
        time.sleep(2)

thr_amqp.stop()

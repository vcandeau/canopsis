#!/usr/bin/env python

import time, signal, threading, json, os
import daemon,lockfile
from neb2socket import *
from Queue import Queue

from hypamqp2 import hypamqp
from amqplib import client_0_8 as amqp


########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "nagios2amqp"
DAEMON_TYPE = "eventsource"

EXCHANGE_NAME = "hypervision"

AMQP_HOST = "localhost"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)

UNX_SOCKET = "/tmp/neb2socket"

BUFFER_QUEUE_MAX_SIZE = 1000

########################################################
#
#   Functions
#
########################################################

#### Connect signals
RUN = 1
def signal_handler(signum, frame):
	#logger.warning("Receive signal to stop daemon...")
	print("Receive signal to stop daemon...")
	global RUN
	RUN = 0

	## Clean Asyncore
	if receiver:
		receiver.stop()

class thread_listen_queue(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
			
	def run(self):	
		logger.debug("thread_listen_queue: Wait event in queue ...")
		self.RUN=1
	
		while self.RUN:
			try:
				event = to_amqp_queue.get(True, timeout=1)
				#logger.debug("Send event to AMQP ...")
				key = DAEMON_TYPE+".nagios."+event["source_name"]+"."+event["type"]+"."+event["source_type"]
				
				if event["type"] == "check":
					key = key +"."+ event["host_name"]
					#if event["source_type"] == "service":
					#	key = key +"."+ event["service_description"]
						
				
				msg = amqp.Message(json.dumps(event))
				myamqp.publish(msg, key)
			except Exception, err:
				#logger.error(err)
				pass
			
	def stop(self):
		self.RUN=0

########################################################
#
#   Callback
#
########################################################

def on_nagios_event(event):
	#logger.debug("on_nagios_event: Push event in Queue ...")
	to_amqp_queue.put(event)
	pass

########################################################
#
#   Main
#
########################################################

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	
	# global
	global to_amqp_queue, receiver, myamqp
	
	# Connect to amqp bus
	myamqp = hypamqp()
	myamqp.connect()

	logger.debug("Create buffer queue ...")
	to_amqp_queue = Queue(BUFFER_QUEUE_MAX_SIZE)

	logger.debug("Start Queue listenner thread ...")
	thr_queue_listenner = thread_listen_queue()
	thr_queue_listenner.start()

	# Read unix socket
	while RUN:
		try:
			receiver = neb2socket(socket_path=UNX_SOCKET, msg_callback=on_nagios_event, output_format="dict", logging_level=logging.DEBUG)
			
			try:
				asyncore.loop()
			except:
				pass
		except:
			logger.error("Conenction error, try to re-connect after 3 seconds ...")
			receiver = None
			time.sleep(3)

	logger.debug("Stop Queue listenner thread ...")
	thr_queue_listenner.stop()
	thr_queue_listenner.join()

if __name__ == "__main__":
	main()

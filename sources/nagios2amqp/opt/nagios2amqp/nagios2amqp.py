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

import time, signal, threading, json, os, sys
import daemon,lockfile
from Queue import Queue

from camqp import camqp, files_preserve
from txamqp.content import Content

sys.path.append(os.path.expanduser("~/opt/event-brokers/nagios/api"))
from neb2socket import *

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "nagios2amqp"
DAEMON_TYPE = "eventsource"

AMQP_HOST = "localhost"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)

UNX_SOCKET = "/tmp/neb2socket"
BUFFER_QUEUE_MAX_SIZE = 1000

receiver = None
myamqp = None

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
	
	## Stop amqp
	if myamqp:
		myamqp.stop()
	
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
				key = "nagios."+event["source_name"]+"."+event["type"]+"."+event["source_type"]
				
				if event["type"] == "check":
					key = key +"."+ event["host_name"]
					if event["source_type"] == "service":
						key = key +"."+ event["service_description"]
						
				
				msg = Content(json.dumps(event))
				myamqp.publish(msg, key, myamqp.exchange_name_events)
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
	myamqp = camqp()
	myamqp.start()

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
			logger.error("Connection error, try to re-connect after 3 seconds ...")
			receiver = None
			time.sleep(3)

	logger.debug("Stop Queue listenner thread ...")
	thr_queue_listenner.stop()
	thr_queue_listenner.join()
	
	logger.debug("Stop AMQP ...")
	myamqp.stop()
	myamqp.join()

if __name__ == "__main__":
	main()

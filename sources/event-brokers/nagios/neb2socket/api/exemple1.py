#!/usr/bin/env python

import time, signal, threading
from neb2socket import *

#### Connect signals
RUN = 1
def signal_handler(signum, frame):
	#logger.warning("Receive signal to stop daemon...")
	print("Receive signal to stop daemon...")
	global RUN
	RUN = 0
	
	## Clean Asyncore
	receiver.stop()
	
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

#### MAIN

def on_event(event):
	#print repr(event)
	print "%s: Event: %s -> %s -> %s" % (event['timestamp'], event['source_name'], event['source_type'], event['type'])
	print "\tHost name:", event['host_name']
	
	if event['source_type'] == "service":
		print "\tService name:", event['service_description']
		
	if event['type'] == "check":
		print "\t\tState: %s (%s) (%s/%s)" % (event['state'], event['state_type'], event['current_attempt'], event['max_attempts'])
		print "\t\tOutput:", event['output']
		print "\t\tPerfdata:", event['perf_data']
	print
	pass

MK_SOCKET = "/tmp/neb2socket"

while RUN:
	try:
		receiver = neb2socket(socket_path=MK_SOCKET, msg_callback=on_event, logging_level=logging.DEBUG)
		try:
			asyncore.loop()
		except:	
			pass
	except:
		print "Conenction error, try to re-connect after 3 seconds ..."
		time.sleep(3)




#!/usr/bin/env python
import time
import logging

from hypamqp2 import hypamqp
from amqplib import client_0_8 as amqp

from pymongo import Connection
import json
import re

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2graphite"
DAEMON_TYPE = "storage"

GRAP_EXCHANGE_NAME = "graphite"

AMQP_HOST = "localhost"

logging.basicConfig(level=logging.DEBUG,
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
	id = msg.delivery_info['routing_key']

	body = json.loads(msg.body)
	#body['_id'] = id

	timestamp = body['timestamp']
	perf_data = body['perf_data']
	if perf_data != "":
		#print "######### Perf_data:", perf_data
		perfs = perf_data.split(' ')
		msg = ""
		for perf in perfs:
			pref = perf.replace(',','.')
			#print "\tperf:", perf
			resultat = re.search('(.*)=([0-9.,]*)(([A-Za-z/]*);?).*',perf);
			metric = resultat.group(1)
			value = resultat.group(2)
			unit = resultat.group(4)
	
			#print "\t\tMetric:", metric
			#print "\t\tValue:", value
			#print "\t\tUnit:", unit
	
			metric_id = id+"."+metric
			metric_id = metric_id.replace(' ','_')
			
			pmsg = "%s %s %i" % (metric_id, value, timestamp)
			
			#pmsg = "%s %i" % (value, timestamp)
			#pmsg = amqp.Message(pmsg)
			#myamqp.publish(pmsg, metric_id, GRAP_EXCHANGE_NAME)

			# For bulk ...
			if msg != "":
				msg = msg + "\n" + pmsg
			else:
				msg =  pmsg

		# For bulk ...
		if msg != "":
			#print "msg: %s\n" % msg
			msg = amqp.Message(msg)
			myamqp.publish(msg, 'metrics', GRAP_EXCHANGE_NAME)

		


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
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


########################################################
#
#   Main
#
########################################################

def main():
	global myamqp
	myamqp = hypamqp()
	myamqp.connect()
	
	myamqp.create_queue(DAEMON_NAME)
	
	myamqp.bind_queue(DAEMON_NAME, "eventsource.*.*.check.#")
	myamqp.consume_queue(DAEMON_NAME, on_message)
	
	while RUN:
		time.sleep(1)
	
	myamqp.disconnect()

if __name__ == "__main__":
	main()




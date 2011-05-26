#!/opt/boa/bin/python
import sys
sys.path.append('/opt/boa/lib')
sys.path.append('/opt/boa/sources/boa/lib')

from stormed import Message
import time, signal, threading, json, logging
from Queue import *
from amqp_2 import amqp

import couchdb



########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "couchdb"
DAEMON_TYPE = "dataware"

AMQP_HOST = "localhost"
AMQP_QUEUE_NAME = DAEMON_TYPE+"."+DAEMON_NAME

NB_WRITE_WHEN_COMPACT = 100

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)


########################################################
#
#   Handler
#
########################################################


#def amqp_worker(worker):
#	while worker.thrrun:
#		time.sleep(1)
		
NB_WRITE = 0
def amqp_on_message(amqp, msg):
	global NB_WRITE	
	evt_data = json.loads(msg.body)['data']

	if evt_data['source'] == "SERVICE":
		doc_id = evt_data['poller_name']+"-"+evt_data['host_name']+"-"+evt_data['service_name']

	if evt_data['source'] == "HOST":
		doc_id = evt_data['poller_name']+"-"+evt_data['host_name']

	if evt_data['source'] == "SERVICE" or evt_data['source'] == "HOST":

		try:
			doc = db_sts[doc_id]
			print "Update ", NB_WRITE , doc.id
			evt_data['_id'] = doc.id
			evt_data['_rev'] = doc.rev
	
		except:
			print "Create ", NB_WRITE,  doc_id
			evt_data['_id'] = doc_id
	
		db_sts.save(evt_data)
		NB_WRITE += 1
	
		if NB_WRITE >= NB_WRITE_WHEN_COMPACT:
			NB_WRITE=0
			print "Compact database ..."
			db_sts.compact()



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


## CouchDB
couch = couchdb.Server('http://127.0.0.1:5984/')
try:
	db_sts = couch.create('status')
except:
	db_sts = couch['status']


## AMQP
thr_amqp = amqp(
	host = AMQP_HOST,
	queue_name = AMQP_QUEUE_NAME,
	routing_keys = [ DAEMON_TYPE+".broadcast", "broadcast", "poller.*.*.EVENT.#"]
	#logging_level = logging.WARNING,
)

thr_amqp.cb_on_message = amqp_on_message
#thr_amqp.fn_worker = amqp_worker

### Start Main !
thr_amqp.start()

while RUN:
        time.sleep(2)

thr_amqp.stop()

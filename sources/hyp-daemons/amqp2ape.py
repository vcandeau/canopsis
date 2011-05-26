#!/opt/boa/bin/python
import sys
sys.path.append('/opt/boa/lib')
sys.path.append('/opt/boa/sources/boa/lib')

from stormed import Message
import time, signal, threading, json, logging
from Queue import *
from amqp_2 import amqp

import urllib2, base64

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2ape"
DAEMON_TYPE = "gateway"

AMQP_HOST = "localhost"
AMQP_QUEUE_NAME = DAEMON_TYPE+"."+DAEMON_NAME

APE_CHAN = "events"
APE_HOST = "127.0.0.1"
APE_PASS = "testpasswd"

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
	#print "--> %r:" % (msg.rx_data.routing_key)
        #print "\t%s" % msg.body

	msg_dict = json.loads(msg.body)
	data = msg_dict['data']

	server = 'http://'+APE_HOST+':6969/0/?'
	cmd = [{'cmd': 'inlinepush',
		'params': {
			'password': APE_PASS,
			'raw': 'postmsg',
			'channel': APE_CHAN,
			'data': {
				'message': base64.b64encode(json.dumps(data))
			}
		}
	}]
	url = server + urllib2.quote(json.dumps(cmd))
	response = urllib2.urlopen(url)
	print(response.read(1000))

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
	routing_keys = [ DAEMON_TYPE+".broadcast", "broadcast" , "poller.*.*.EVENT.#"]
	#logging_level = logging.WARNING,
)

thr_amqp.cb_on_message = amqp_on_message

### Start Main !
thr_amqp.start()

while RUN:
        time.sleep(2)

thr_amqp.stop()

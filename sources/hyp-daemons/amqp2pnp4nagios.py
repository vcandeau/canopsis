#!/opt/boa/bin/python
import sys
sys.path.append('/opt/boa/lib')
sys.path.append('/opt/boa/sources/boa/lib')

from stormed import Message
import time, signal, threading, json, logging
from amqp_2 import amqp

import os


########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2pnp4nagios"
DAEMON_TYPE = "dataware"

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
	#print "--> %r:" % (msg.rx_data.routing_key)
        #print "\t%s" % msg.body

	msg_dict = json.loads(msg.body)
	data = msg_dict['data']

	os.environ['NAGIOS_HOSTNAME']           = ""
	os.environ['NAGIOS_SERVICEDESC']        = ""
	os.environ['NAGIOS_SERVICEPERFDATA']    = ""
	os.environ['NAGIOS_SERVICECHECKCOMMAND']= ""
	os.environ['NAGIOS_TIMET']              = ""

	os.environ['NAGIOS_HOSTNAME']           = data['poller_name'] + "-" + data['host_name']
	os.environ['NAGIOS_SERVICEDESC']        = data['service_name']
	os.environ['NAGIOS_SERVICEPERFDATA']    = data['perf_data']
	os.environ['NAGIOS_SERVICECHECKCOMMAND']= data['check_command']
	os.environ['NAGIOS_TIMET']              = data['last_check']

	if data['perf_data'] != "":
		print "Send perfdata to pnp4nagios ..."
		print data['poller_name'], os.environ['NAGIOS_HOSTNAME'], os.environ['NAGIOS_SERVICEDESC'], os.environ['NAGIOS_SERVICEPERFDATA']
		os.system("perl /opt/boa/opt/pnp4nagios/libexec/process_perfdata.pl")
	else:
		print "No perfdata for",os.environ['NAGIOS_HOSTNAME'],os.environ['NAGIOS_SERVICEDESC']


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

# ex: poller.nagios.PollerVM.EVENT.STATUS.SERVICE

thr_amqp = amqp(
	host = AMQP_HOST,
	queue_name = AMQP_QUEUE_NAME,
	routing_keys = [ DAEMON_TYPE+".broadcast", "broadcast", "poller.*.*.EVENT.STATUS.SERVICE"]
	#logging_level = logging.WARNING,
)

thr_amqp.cb_on_message = amqp_on_message

### Start Main !
thr_amqp.start()

while RUN:
        time.sleep(2)

thr_amqp.stop()

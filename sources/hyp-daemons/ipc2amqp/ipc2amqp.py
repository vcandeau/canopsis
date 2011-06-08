#!/opt/boa/bin/python

import time
import signal
import threading
import json
import logging

import sysv_ipc
import socket
from Queue import *

from hypamqp import hypamqp

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "nagios2amqp"
DAEMON_TYPE = "poller"
POLLER_NAME = "PollerVM"
EXCHANGE_NAME = "hypervision"

AMQP_HOST = "localhost"
AMQP_QUEUE_NAME = DAEMON_TYPE + ".nagios." + POLLER_NAME

TO_AMQP_QUEUE = Queue(1000)

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)

########################################################
#
#   Threads
#
########################################################

### IPC
class thread_ipc_receiver(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.mq = sysv_ipc.MessageQueue(0x0001e240)
	logger.debug("IPC Receiver Initialized")

    def run(self):
        #safety wait
        time.sleep(1	)
	logger.debug("IPC Receiver is running ...")

        while RUN:
            try:
            	## Receive message from IPC Queue
            	message, type = self.mq.receive(block=False)
            	message = str(message)
            	self.parse_message(type, message)
            except:
                time.sleep(0.5)

    def parse_message(self, type, message):
        if (message.find('\0') < 0):
            logger.warning("Message should end with '\\0' character")

        message, char, garbage = message.partition('\0')

	logger.debug("Type: %i Message (%s): \n%s\n" %(type, len(message), str(message)))

        evt = None

        message = message.split('^')

	# ACK
        if type == 29:
            evt = {
                'poller_name': POLLER_NAME,
                'type': 'ACK',
                'timestamp': message[0],
                'host_name': message[1],
                'author_name': message[3],
                'comment': message[4],
                'state': message[5]
            }

            if message[2] != "na":
                evt['source'] = 'SERVICE'
                evt['service_name'] = message[2]
            else:
                evt['source'] = 'HOST'

	# SERVICE or HOST status
        if type == 13 or type == 14:
            evt = {
                'poller_name': POLLER_NAME,
                'type': 'STATUS',
                'host_name': message[1],
                'last_check': message[0],
                'next_check': message[8],
                'last_hard_state': message[9],
                'last_hard_state_change': message[10],
                'problem_has_been_acknowledged': message[11],
                'acknowledgement_type': message[12],
                'current_state': message[4],
                'current_attempt': message[17],
                'max_attempts': message[13],
                'state_type': message[5],
                'check_command': message[3],
                'plugin_output': message[6],
                'long_plugin_output': message[14],
                'perf_data': message[7],
                'latency': message[15],
                'execution_time': message[16]
            }

            ## SERVICE
            if type == 13:
                evt['source'] = 'SERVICE'
                evt['service_name'] = message[2]

            if type == 14:
                evt['source'] = 'HOST'


	### Send Event to Queue
	if evt != None:
		#logger.debug("Event: %s" % evt)

                if TO_AMQP_QUEUE.full():
                    logger.warning("Queue is FULL, most old event will be deleted ...")
                    queue.get()

                TO_AMQP_QUEUE.put(evt)

    def stop(self):
        pass

### AMQP
class thread_amqp_emitter(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)


	self.amqp = hypamqp(
		logging_level=logging.ERROR,
		hostname="127.0.0.1",
		port=5672,
                userid="guest",
                password="guest",
                virtual_host="/",
		insist=True,
		exchange_name=EXCHANGE_NAME
		)

	self.amqp.connect()

	logger.debug("AMQP Emitter Initialized")


    def run(self):
	logger.debug("AMQP Emitter is running ...")
        old_evt_json = None

        while RUN:
	    if self.amqp.connected:
    		try:
		        evt = None
		        evt = TO_AMQP_QUEUE.get(True, 1)

		        evt_json = json.dumps({'type': 'EVENT', 'data': evt})

		        if evt_json == old_evt_json:
		            logger.warning("Same event, nothing to do ...")
		            raise NameError('SameEvent')

		        old_evt_json = evt_json

		        rk = "poller.nagios." + evt['poller_name'] + ".EVENT." + evt['type'] + "." + evt['source']
	
			self.amqp.publishTopic(evt_json, rk)

			TO_AMQP_QUEUE.task_done()

		except:
		      	# No events in queue
		        #logger.debug("No event in queue ...")
		        pass

	    else:
		time.sleep(3)	



    def stop(self):
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
#   Main
#
########################################################


thr_ipc = thread_ipc_receiver()
thr_amqp = thread_amqp_emitter()

### Start Main !
thr_ipc.start()
thr_amqp.start()

### Main Loop
while RUN:
        time.sleep(2)

thr_ipc.stop()
thr_amqp.stop()

#!/usr/bin/env python

import unittest
import threading, time, json


from hypamqp2 import hypamqp
from amqplib import client_0_8 as amqp


msgbody = '{"type": "check", "source_name": "Central", "source_type": "host", "timestamp": "1307518560", "host_name": "localhost16", "check_type": "0", "current_attempt": "1", "max_attempts": "10", "state_type": "1", "state": "0", "execution_time": "4.035", "latency": "0.218", "command_name": "check-host-alive", "output": "PING OK -  Paquets perdus = 0%, RTA = 0.04 ms", "long_output": "", "perf_data": "rta=0.037000ms;3000.000000;5000.000000;0.000000 pl=0%;80;100;0"}'
myamqp = None
rcvmsgbody = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.rcvmsgbody = None

	def test_1_Connect(self):
		global myamqp
		myamqp = hypamqp()
		myamqp.connect()
		#time.sleep(2)
		#myamqp.disconnect()
		pass

	def on_message(self, msg):
		print "Receive message ..."
		global rcvmsgbody
		if msg.body != "BYE":
			rcvmsgbody = msg.body
		
	def test_2_CreateQueue(self):
		global myamqp
		myamqp.create_queue("unit_test")

	def test_3_BindQueue(self):
		myamqp.bind_queue("unit_test", "unit_test.#")
		time.sleep(1)
		pass
		
	def test_4_ConsumeQueue(self):		
		myamqp.consume_queue("unit_test", self.on_message)
		pass

	def test_5_PublishMessage(self):
		msg = amqp.Message(msgbody)
		myamqp.publish(msg, "unit_test.testmessage")
		
	def test_6_CheckReceiveInQueue(self):		
		#myamqp.queue_wait("unit_test")
		time.sleep(1)
		if rcvmsgbody != msgbody:
			raise NameError, 'Received Event is not conform'

	def test_99_Disconnect(self):
		global myamqp
		myamqp.disconnect()
		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	

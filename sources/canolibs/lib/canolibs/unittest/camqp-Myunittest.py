#!/usr/bin/env python

import unittest
import threading, time, json


from camqp import camqp
from txamqp.content import Content

msgbody = '{"type": "check", "source_name": "Central", "source_type": "host", "timestamp": "1307518560", "host_name": "localhost16", "check_type": "0", "current_attempt": "1", "max_attempts": "10", "state_type": "1", "state": "0", "execution_time": "4.035", "latency": "0.218", "command_name": "check-host-alive", "output": "PING OK -  Paquets perdus = 0%, RTA = 0.04 ms", "long_output": "", "perf_data": "rta=0.037000ms;3000.000000;5000.000000;0.000000 pl=0%;80;100;0"}'
myamqp = None
rcvmsgbody = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.rcvmsgbody = None

	def test_1_Init(self):
		global myamqp
		myamqp = camqp()

	def test_2_CreateQueue_and_Bind(self):
		global myamqp
		myamqp.add_queue("unit_test", "unit_test.#", self.on_message)

	def test_3_Connect(self):
		global myamqp
		myamqp.start()
		
	def on_message(self, msg):
		print "Receive message ..."
		global rcvmsgbody
		#if msg.body != "BYE":
		rcvmsgbody = msg.content.body
		print rcvmsgbody

	def test_4_PublishMessage(self):
		msg = Content(msgbody)
		myamqp.publish(msg, "unit_test.testmessage")
		
	def test_5_CheckReceiveInQueue(self):		
		start = time.time()
		end = start + 5.0
		while not rcvmsgbody:
			time.sleep(0.1)
			if time.time() > (end+5.0):
				break
		
		duration = time.time() - start
		print "Receive message in", duration,"ms"
		if rcvmsgbody != msgbody:
			raise NameError, 'Received Event is not conform'

	def test_99_Disconnect(self):
		global myamqp
		myamqp.stop()
		myamqp.join()
		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	

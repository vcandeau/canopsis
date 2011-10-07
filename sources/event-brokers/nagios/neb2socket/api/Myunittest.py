#!/usr/bin/env python

import unittest
import threading, time, json
import socket
import os, os.path, sys

sys.path.append(os.path.expanduser("~/opt/event-brokers/nagios/api"))
from neb2socket import *

UNX_SOCKET = "/tmp/neb2socket_utest"
testevent = '{"type": "check", "source_name": "Central", "source_type": "host", "timestamp": "1307518560", "host_name": "localhost16", "check_type": "0", "current_attempt": "1", "max_attempts": "10", "state_type": "1", "state": "0", "execution_time": "4.035", "latency": "0.218", "command_name": "check-host-alive", "output": "PING OK -  Paquets perdus = 0%, RTA = 0.04 ms", "long_output": "", "perf_data": "rta=0.037000ms;3000.000000;5000.000000;0.000000 pl=0%;80;100;0"}'

class KnownValues(unittest.TestCase): 
	
	def on_nagios_event(self, event):
		#print event
		self.rcvevent = event
		
	def start_TestEnv(self):
		self.thr = maketestenv()
		self.thr.start()
		time.sleep(1)
		
	def stop_TestEnv(self):
		self.thr.join()

	def test_1_RcvEvent(self):
		self.rcvevent = None
		self.start_TestEnv()
		receiver = neb2socket(socket_path=UNX_SOCKET, msg_callback=self.on_nagios_event, output_format="json")
		asyncore.loop(timeout=0.5, count=5)
		self.stop_TestEnv()
		if self.rcvevent == testevent:
			print "Received Event is conform"
		else:
			raise NameError, 'Received Event is not conform'
		
	def test_2_JsonEventDecode(self):
		self.rcvevent = None
		self.start_TestEnv()
		receiver = neb2socket(socket_path=UNX_SOCKET, msg_callback=self.on_nagios_event, output_format="json")
		asyncore.loop(timeout=0.5, count=5)
		self.stop_TestEnv()
		if self.rcvevent == testevent:
			data = json.loads(self.rcvevent)
			print "host_name:", data['host_name']


class maketestenv(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
		self.RUN=0
		
	def run(self):
		#print "Start test's environnement ..."

		if os.path.exists( UNX_SOCKET ):
		  os.remove( UNX_SOCKET )

		#print "Opening socket..."
		server = socket.socket( socket.AF_UNIX, socket.SOCK_STREAM)
		server.bind(UNX_SOCKET)

		#print "Listening..."
		server.listen(1)
		conn, addr = server.accept()
		while True:
		  data = conn.recv(1)
		  if data:
			conn.send(testevent)
			break

		time.sleep(1)
		server.close()
		os.remove( UNX_SOCKET )
		#print "End of test's environnement"
		pass
		
		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	

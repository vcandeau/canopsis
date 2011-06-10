#!/usr/bin/env python

import threading, time, json
import socket
import os, os.path
from neb2socket import *

UNX_SOCKET = "/tmp/neb2socket"
testevent = '{"type": "check", "source_name": "Bench", "source_type": "host", "timestamp": "1307518560", "host_name": "localhost16", "check_type": "0", "current_attempt": "1", "max_attempts": "10", "state_type": "1", "state": "0", "execution_time": "4.035", "latency": "0.218", "command_name": "check-host-alive", "output": "PING OK -  Paquets perdus = 0%, RTA = 0.04 ms", "long_output": "", "perf_data": "rta=0.037000ms;3000.000000;5000.000000;0.000000 pl=0%;80;100;0","benchtime": "'


#print "Start test's environnement ..."

if os.path.exists( UNX_SOCKET ):
	os.remove( UNX_SOCKET )

print "Opening socket..."
server = socket.socket( socket.AF_UNIX, socket.SOCK_STREAM)
server.bind(UNX_SOCKET)
os.chmod(UNX_SOCKET,777)

print "Listening..."
server.listen(1)
conn, addr = server.accept()
while True:
  data = conn.recv(1)
  if data:
	print "Bench it !"
	for num in range(0, 50000, 1):
		event = testevent + '"}\n'
		conn.send(event)
	break
	
print "End of bench"	
server.close()
os.remove( UNX_SOCKET )
print "End of test's environnement"
pass

	

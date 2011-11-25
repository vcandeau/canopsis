#!/usr/bin/env python
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------

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
	for num in range(0, 10, 1):
		event = testevent + '"}\n'
		conn.send(event)
	break
	
print "End of bench"	
server.close()
os.remove( UNX_SOCKET )
print "End of test's environnement"
pass

	

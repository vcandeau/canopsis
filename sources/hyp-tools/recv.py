#! /usr/bin/env python

from socket import gethostname
import time
from kombu import BrokerConnection

connection = BrokerConnection(hostname="localhost",
                                  userid="guest",
                                  password="guest",
                                  virtual_host="/")

queue = connection.SimpleQueue("myqueue", no_ack=True)

#message = queue.get(block=True, timeout=1)

while True:
	try:
		message = queue.get(block=True, timeout=1)
		content = message.payload # deserialized data.
		print content
	except:
		print "no msg"
		time.sleep(1)


#queue.close()

connection.release()

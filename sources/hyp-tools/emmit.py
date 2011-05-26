#! /usr/bin/env python

from socket import gethostname
from time import time
from kombu import BrokerConnection

connection = BrokerConnection(hostname="localhost",
                                  userid="guest",
                                  password="guest",
                                  virtual_host="/")

queue = connection.SimpleQueue("myqueue")

queue.put({"message": "Hello",
                        "hostname": gethostname(),
                        "timestamp": time()},
                        serializer="json",
                        compression=None)

queue.close()

#!/usr/bin/env python

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content

from pymongo import Connection
import json

from twisted.internet import reactor, task

from gevent import spawn
from gevent import pywsgi
from gevent.pool import Pool
from geventwebsocket.handler import WebSocketHandler

import ConfigParser, os

########################################################
#
#   Configuration
#
########################################################
DAEMON_NAME = "amqp2websocket"
DAEMON_TYPE = "transport"

amqp = None
wsclients = []

MAX_WSCLIENT = 20

## Read config file
config = ConfigParser.RawConfigParser()
config.read(os.path.expanduser('~/etc/amqp2websocket.conf'))

## get config
port=config.getint("server", "port")
debug=config.getboolean("server", "debug")
interface=config.get("server", "interface")

try:
	process = int(sys.argv[1])
	port = port + (process - 1)
except:
	pass

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.INFO
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("amqp2websocket")

########################################################
#
#   Functions
#
########################################################

def on_message(msg):
	rk = msg.routing_key
 	#event = json.loads(msg.content.body)

	for wsclient in wsclients:
		try:
			wsclient.send(msg.content.body)
		except:
			pass



def on_websocket(environ, start_response):
    if environ["PATH_INFO"] == '/':
	try:
	        ws = environ["wsgi.websocket"]
		nb = len(wsclients)
		if nb >= MAX_WSCLIENT:
			logger.warning("Max websocket clients reached ...")
		else:
			wsclients.append(ws)
			nb += 1
			logger.debug("Open websocket ... (%s/%s)" % (nb, MAX_WSCLIENT))
			
			while RUN:
			        message = ws.wait()
				if not message:
					break

			logger.debug("Close websocket.")
			wsclients.remove(ws)
			
	except:
		logger.error("Impossible to create websocket ...")


#### Connect signals
RUN = 1
import signal
def signal_handler(signum, frame):
	logger.warning("Receive signal to stop daemon...")
	global RUN
	RUN = 0
 

########################################################
#
#   Main
#
########################################################

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, RUN
	# AMQP
	amqp = camqp(logging_level=logging_level)

	amqp.add_queue(DAEMON_NAME, ['#.check.#'], on_message, amqp.exchange_name_events)
	amqp.start()

	#pool = Pool(MAX_WSCLIENT)
	wsserver = pywsgi.WSGIServer((interface, port), on_websocket, handler_class=WebSocketHandler)

	try:
		wsserver.serve_forever()
	except:
		RUN=0

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

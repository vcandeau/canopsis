#!/usr/bin/env python

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content

from pymongo import Connection
import json

from twisted.internet import reactor, task

from gevent import spawn

import gevent.pywsgi
from ws4py.server.wsgi.middleware import WebSocketUpgradeMiddleware
from ws4py.server.geventserver import UpgradableWSGIHandler, WebSocketServer

from cconfig import cconfig

########################################################
#
#   Configuration
#
########################################################
DAEMON_NAME = "amqp2websocket"
DAEMON_TYPE = "transport"

CONFIG = cconfig(name=DAEMON_NAME)

amqp = None
wsclients = []

MAX_WSCLIENT = 20

## get config
port=CONFIG.getint("port", 8090)
debug=CONFIG.getbool("debug", False)
interface=CONFIG.getstring("interface", "0.0.0.0")
MAX_WSCLIENT=CONFIG.getint("max_clients", 20)

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



def on_websocket(websocket, environ):
	websocket.sock.settimeout(None)
	nb = len(wsclients)
	if nb >= MAX_WSCLIENT:
		logger.warning("Max websocket clients reached ...")
		websocket.close()
		return

	wsclients.append(websocket)
	nb += 1
	logger.debug("Open websocket ... (%s/%s)" % (nb, MAX_WSCLIENT))

	try:
		while True:
			msg = websocket.receive(msg_obj=True)
			logger.debug("Msg: %s" % msg)

			if websocket.client_terminated:
					logger.debug("Client terminated !")	
					break

			if websocket.server_terminated:
					logger.debug("Server terminated !")	
					break

	except IOError:
		logger.error("Websocket IOError ...")

	logger.debug("Close websocket ... ")	
	wsclients.remove(websocket)
	websocket.close()


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
	#wsserver = pywsgi.WSGIServer((interface, port), on_websocket, handler_class=WebSocketHandler)
	wsserver = WebSocketServer((interface, port), on_websocket)

	try:
		wsserver.serve_forever()
	except:
		RUN=0

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

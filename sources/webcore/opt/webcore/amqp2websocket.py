#!/usr/bin/env python
# --------------------------------
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

import time

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

from cinit import init

########################################################
#
#   Configuration
#
########################################################
DAEMON_NAME = "amqp2websocket"
DAEMON_TYPE = "transport"

CONFIG = cconfig(name=DAEMON_NAME)

init 	= init(DAEMON_NAME)

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
	logger 	= init.get_logger("DEBUG")
else:
	logger 	= init.get_logger("INFO")
	
handler = init.handler(logger)

########################################################
#
#   Functions
#
########################################################

def on_message(msg):
	rk = msg.routing_key
 	event = json.loads(msg.content.body)

	for wsclient in wsclients:
		try:
			event['_id'] = rk
			event['id'] = rk
			wsclient.send(json.dumps(event))
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

########################################################
#
#   Main
#
########################################################

def main():

	handler.run()	

	global amqp

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['#'], on_message, amqp.exchange_name_alerts)
	amqp.start()

	#pool = Pool(MAX_WSCLIENT)
	#wsserver = pywsgi.WSGIServer((interface, port), on_websocket, handler_class=WebSocketHandler)
	wsserver = WebSocketServer((interface, port), on_websocket)

	try:
		wsserver.serve_forever()
	except:
		handler.set(0)

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

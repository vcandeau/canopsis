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

from camqp import camqp

from pymongo import Connection
import json

from gevent import spawn

import gevent.pywsgi
from ws4py.server.wsgi.middleware import WebSocketUpgradeMiddleware
from ws4py.server.geventserver import UpgradableWSGIHandler, WebSocketServer

import ConfigParser, os

from cinit import cinit

########################################################
#
#   Configuration
#
########################################################
DAEMON_NAME = "amqp2websocket"
DAEMON_TYPE = "transport"

init 	= cinit()

amqp = None
wsclients = []


## Configurations

config_filename = os.path.expanduser('~/etc/' + DAEMON_NAME + '.conf')
config = ConfigParser.RawConfigParser()
config.read(config_filename)

## default config
port=8090
debug=False
interface="0.0.0.0"
maxclients = 20

try:
	## get config
	port=config.getint('server', "port")
	debug=config.getboolean('server', "debug")
	interface=config.get('server', "interface")
	maxclients=config.getint('server', "maxclients")
except Exception, err:
	print "Error when reading '%s' (%s)" % (config_filename, err)

## Logger
if debug:
	logger 	= init.getLogger(DAEMON_NAME, "DEBUG")
else:
	logger 	= init.getLogger(DAEMON_NAME, "INFO")
	
handler = init.getHandler(logger)
	

try:
	process = int(sys.argv[1])
	port = port + (process - 1)
except:
	pass


########################################################
#
#   Functions
#
########################################################

def on_message(event, msg):
	rk = msg.delivery_info['routing_key']

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
	if nb >= maxclients:
		logger.warning("Max websocket clients reached ...")
		websocket.close()
		return

	wsclients.append(websocket)
	nb += 1
	logger.info("Open websocket ... (%s/%s)" % (nb, maxclients))

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

	logger.info("Close websocket ... ")	
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

	#pool = Pool(maxclients)
	#wsserver = pywsgi.WSGIServer((interface, port), on_websocket, handler_class=WebSocketHandler)
	wsserver = WebSocketServer((interface, port), on_websocket)

	logger.info("Wait connections ...")
	try:
		wsserver.serve_forever()
	except:
		handler.set(0)

	amqp.stop()
	amqp.join()
	logger.info("Daemon stopped")

if __name__ == "__main__":
	main()

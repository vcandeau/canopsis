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

import sys, time

import bottle
from bottle import route, run, static_file, redirect
from beaker.middleware import SessionMiddleware

from cinit import cinit
from ctools import dynmodloads

import ConfigParser, os

## Load webservices
dynmodloads("~/opt/webcore/libexec/")

from gevent import monkey; monkey.patch_all()

init = cinit()

## Configurations

config_filename	= os.path.expanduser('~/etc/webserver.conf')
config		= ConfigParser.RawConfigParser()
config.read(config_filename)

## default config
port		= 8082
debug		= True
interface	= "0.0.0.0"

session_cookie_expires	= 300
session_secret		= 'canopsis'
session_data_dir 	= os.path.expanduser('~/tmp/webcore_cache')
root_directory		= os.path.expanduser("~/var/www/")

try:
	## get config
	port		= config.getint('server', "port")
	debug		= config.getboolean('server', "debug")
	interface	= config.get('server', "interface")
	root_directory	= os.path.expanduser(config.get('server', "root_directory"))

	session_cookie_expires	= config.getint('session', "cookie_expires")
	session_secret		= config.get('session', "secret")
	session_data_dir	= os.path.expanduser(config.get('session', "data_dir"))

except Exception, err:
	print "Error when reading '%s' (%s)" % (config_filename, err)

try:
	process = int(sys.argv[1])
	port = port + (process - 1)
except:
	pass

## Logger
if debug:
	logger 	= init.getLogger("webserver-%s" % port, "DEBUG")
else:
	logger 	= init.getLogger("webserver-%s" % port, "INFO")


def main():
	bottle.debug(debug)

	##Session system with beaker
	session_opts = {
	    'session.type': 'file',
	    'session.cookie_expires': session_cookie_expires,
	    'session.data_dir': session_data_dir,
	    'session.auto': True,
	#   'session.timeout': 300,
	    'session.secret': session_secret
	}
	app = SessionMiddleware(bottle.app(), session_opts)

	## Basic Handler
	@bottle.route('/static/:path#.+#')
	def server_static(path):
		return static_file(path, root=root_directory)

	@bottle.route('/')
	@bottle.route('/index.html')
	def index():
		redirect("/static/canopsis/auth.html?url=/static/canopsis/index.html")

	try:
		logger.info("Start listenning on port %i" % port)
		bottle.run(app, host=interface, port=port, reloader=False, server='gevent')
	except:
		pass

	logger.info("Daemon stopped")

if __name__ == "__main__":
	main()

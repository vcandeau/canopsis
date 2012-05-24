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

from cinit import cinit
from ctools import dynmodloads

import ConfigParser, os

import bottle
from bottle import route, run, static_file, redirect
from libexec.auth import autologin

## Hack: Prevent "ExtractionError: Can't extract file(s) to egg cache" when 2 process extract egg at the same time ...
try:
	from beaker.middleware import SessionMiddleware
except:
	time.sleep(2)
	from beaker.middleware import SessionMiddleware

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
session_secret			= 'canopsis'
session_lock_dir		= os.path.expanduser('~/tmp/webcore_cache')
session_mongo_url		= 'mongodb://localhost:27017/canopsis.beaker'
root_directory			= os.path.expanduser("~/var/www/")

try:
	## get config
	port					= config.getint('server', "port")
	debug					= config.getboolean('server', "debug")
	interface				= config.get('server', "interface")
	root_directory			= os.path.expanduser(config.get('server', "root_directory"))

	session_cookie_expires	= config.getint('session', "cookie_expires")
	session_secret			= config.get('session', "secret")
	session_data_dir		= os.path.expanduser(config.get('session', "data_dir"))

except Exception, err:
	print "Error when reading '%s' (%s)" % (config_filename, err)

try:
	process = int(sys.argv[1])
	port = port + (process - 1)
except:
	pass

## Logger
if debug:
	logger 	= init.getLogger("%s-webserver" % os.getpid(), "DEBUG")
else:
	logger 	= init.getLogger("%s-webserver" % os.getpid(), "INFO")

## Load webservices
dynmodloads("~/opt/webcore/libexec/")

bottle.debug(debug)

##Session system with beaker

session_opts = {
    'session.type': 'mongodb',
    'session.cookie_expires': session_cookie_expires,
    'session.url' : session_mongo_url,
    'session.auto': True,
#   'session.timeout': 300,
    'session.secret': session_secret,
    'session.lock_dir' : session_lock_dir,
}

## Basic Handler
@bottle.route('/static/:path#.+#')
def server_static(path):
	return static_file(path, root=root_directory)

@bottle.route('/favicon.ico')
def favicon():
	return

@bottle.route('/')
@bottle.route('/:key')
@bottle.route('/index.html')
def index(key=None):
	#autologin
	if key:
		if len(key) == 56:
			logger.debug('key for autologin privided, seach if account match')
			autologin(key)

	redirect("/static/canopsis/auth.html?url=/static/canopsis/index.html")

## Gunicorn Hook
def on_starting(server):
    logger.info("#################-> on_starting")


## App
try:
	app = SessionMiddleware(bottle.app(), session_opts)
except Exception, err:
	logger.info("Stop dameon (%s)" % err)

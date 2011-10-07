#!/usr/bin/env python
from gevent import monkey; monkey.patch_all()

import sys, os, logging
import ConfigParser

import bottle
from bottle import route, run, static_file, redirect

from beaker.middleware import SessionMiddleware

from ctools import dynmodloads

## Read config file
config = ConfigParser.RawConfigParser()
config.read(os.path.expanduser('~/etc/webcore.conf'))

## get config
root_directory=os.path.expanduser(config.get("server", "root_directory"))
port=config.getint("server", "port")
debug=config.getboolean("server", "debug")
debug = True

bottle.debug(debug)

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("webcore")

##Session system with beaker
session_opts = {
    'session.type': 'file',
    'session.cookie_expires': 300,
    'session.data_dir': '/opt/canopsis/tmp/webcore_cache',
    'session.auto': True
}
app = SessionMiddleware(bottle.app(), session_opts)
logger.debug(str(app))

#test for beaker
@bottle.route('/test')
def test():
	s = bottle.request.environ.get('beaker.session')
	s['test'] = s.get('test',0) + 1
	s.save()
	return 'Test counter: %d' % s['test']

## Basic Handler
@bottle.route('/static/:path#.+#')
def server_static(path):
	return static_file(path, root=root_directory)

@bottle.route('/')
@bottle.route('/index.html')
def index():
	redirect("/static/canopsis/index.html")



	



## Load webservices
dynmodloads("~/opt/webcore/libexec/")

def main():
		try:
			logger.debug("Start listenning on port %i" % port)
			bottle.run(app, host='0.0.0.0', port=port, reloader=debug, server='gevent')
		except:
			pass

if __name__ == "__main__":
	main()

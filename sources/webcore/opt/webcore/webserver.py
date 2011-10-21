#!/usr/bin/env python
import sys, os, logging, time

import bottle
from bottle import route, run, static_file, redirect
from beaker.middleware import SessionMiddleware

from gevent import monkey; monkey.patch_all()

from cconfig import cconfig

CONFIG = cconfig(name="webserver")

def main():
	#import protection function
	#from libexec.auth import check_auth

	from ctools import dynmodloads

	## get config
	root_directory=os.path.expanduser(CONFIG.getstring("root_directory", "~/var/www/"))
	port=CONFIG.getint("port", 8082)
	debug=CONFIG.getbool("debug", False)
	interface=CONFIG.getstring("interface", "0.0.0.0")

	try:
		process = int(sys.argv[1])
		port = port + (process - 1)
	except:
		pass

	bottle.debug(debug)

	## Logger
	if debug:
		logging_level=logging.DEBUG
	else:
		logging_level=logging.INFO
	logging.basicConfig(level=logging_level,
			format='%(asctime)s %(name)s %(levelname)s %(message)s',
	)
	logger = logging.getLogger("webserver-"+str(port))

	##Session system with beaker
	session_opts = {
	    'session.type': 'file',
	    'session.cookie_expires': 300,
	    'session.data_dir': '/opt/canopsis/tmp/webcore_cache',
	    'session.auto': True,
	#   'session.timeout': 300,
	    'session.secret': 'canopsis'
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


	## Load webservices
	dynmodloads("~/opt/webcore/libexec/")

	try:
		logger.info("Start listenning on port %i" % port)
		bottle.run(app, host=interface, port=port, reloader=False, server='gevent')
	except:
		pass

if __name__ == "__main__":
	main()

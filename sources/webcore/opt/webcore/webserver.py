#!/usr/bin/env python

import sys, os, logging
import ConfigParser

import bottle
from bottle import route, run, static_file, redirect

## Read config file
config = ConfigParser.RawConfigParser()
config.read(os.path.expanduser('~/etc/webcore.conf'))

## get config
root_directory=os.path.expanduser(config.get("server", "root_directory"))
port=config.getint("server", "port")
debug=config.getboolean("server", "debug")
debug = True

bottle.debug(debug)

ws_dir=os.path.expanduser("~/opt/webcore/libexec/")
sys.path.append(ws_dir)

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("webcore")

## Basic Handler
@route('/static/:path#.+#')
def server_static(path):
	return static_file(path, root=root_directory)

@route('/')
@route('/index.html')
def index():
	redirect("/static/canopsis/index.html")

## Load libexec
for ws in os.listdir(ws_dir):
	if ws[0] != "." :
		ext = ws.split(".")[1]
		ws = ws.split(".")[0]
		if ext == "py":
			logger.debug("Trying to load webservice '%s'" % ws)
			try:
				exec "import %s" % ws
				logger.debug("\tLoaded successfully ...")
			except Exception, err:
				logger.error("\t%s" % err)
				logger.error("\tImpossible to load.")

def main():
		try:
			logger.debug("Start listenning on port %i" % port)
			run(host='localhost', port=port, reloader=debug)
		except:
			pass

if __name__ == "__main__":
	main()

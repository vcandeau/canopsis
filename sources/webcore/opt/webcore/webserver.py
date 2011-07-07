#!/usr/bin/env python

import sys, os, logging
import ConfigParser
import tornado.ioloop
import tornado.web
import tornado.options

## Read config file
config = ConfigParser.RawConfigParser()
config.read(os.path.expanduser('~/etc/webcore.conf'))

## get config
root_directory=os.path.expanduser(config.get("server", "root_directory"))
port=config.getint("server", "port")
debug=config.getboolean("server", "debug")

ws_dir=os.path.expanduser("~/opt/webcore/webservices/")
sys.path.append(ws_dir)

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("tornado")

## Tornado settings
settings = {
	"debug": debug,
	"static_path": root_directory,
	"cookie_secret": "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
	"login_url": "/static/canopsis/index.html",
	#"xsrf_cookies": True,
}

## Handler
class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.redirect("/static/canopsis/index.html")

class WebservicesHandler(tornado.web.RequestHandler):
	def get(self, ws, action):
		self.redirect("/static/canopsis/index.html")


handlers = [ (r"/", MainHandler) ]


## Load webservices
for ws in os.listdir(ws_dir):
	if ws[0] != "." :
		ext = ws.split(".")[1]
		ws = ws.split(".")[0]
		if ext == "py":
			logger.debug("Trying to load webservice '%s'" % ws)
			try:
				exec "import %s" % ws
				exec "handlers.append((r'/webservices/%s/([a-zA-Z0-9_/-]*)', %s.Handler))" % (ws, ws)
				logger.debug("\tLoaded successfully ...")
			except Exception, err:
				logger.error("\t%s" % err)
				logger.error("\tImpossible to load.")

#print handlers
#class TestJSONHandler():
#	def __init__():
#		pass

#body_handlers = [
#    ("application/json", TestJSONHandler),
#]

def main():
	application = tornado.web.Application(handlers, **settings)
	tornado.options.enable_pretty_logging() 
	#application.listen(port, body_handlers=body_handlers)
	application.listen(port)
	try:
		logger.debug("Start listenning on port %i" % port)
		tornado.ioloop.IOLoop.instance().start()
	except:
		pass

if __name__ == "__main__":
	main()

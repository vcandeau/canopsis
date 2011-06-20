#! /usr/bin/env python
import os
import tornado.httpserver
import tornado.ioloop
import tornado.wsgi
import sys
import django.core.handlers.wsgi
sys.path.append(os.path.expanduser("~/opt/graphite/webapp"))

########################################################
#
#   Functions
#
########################################################

#### Connect signals
RUN = 1
import signal
def signal_handler(signum, frame):
    print "Receive signal to stop daemon..."
    global RUN
    RUN = 0
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

########################################################
#
#   Main
#
########################################################

def main():
	os.environ['DJANGO_SETTINGS_MODULE'] = 'graphite.settings'

	application = django.core.handlers.wsgi.WSGIHandler()

	container = tornado.wsgi.WSGIContainer(application)

	http_server = tornado.httpserver.HTTPServer(container)
	http_server.listen(8081)
	
	tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
	main()

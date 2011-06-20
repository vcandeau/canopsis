#!/usr/bin/env python

import sys
BASE_PATH="/home/wpain/Bureau/hypervision/sources"
PORT=8080
sys.path.append(BASE_PATH+"/var/www/webserver/webcore")
sys.path.append(BASE_PATH+"/www/webserver/webcore")

import tornado.ioloop
import tornado.web

import auth

settings = {
	"debug": True,
    "static_path": BASE_PATH+"/www/html/",
    "cookie_secret": "61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
    "login_url": "/static/index.html",
    "xsrf_cookies": True,
}

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("/static/index.html")


application = tornado.web.Application([
    (r"/", MainHandler),
    
    (r"/webcore/auth/([a-zA-Z]*)", auth.authHandler),
    
], **settings)


if __name__ == "__main__":
	application.listen(PORT)
	try:
		tornado.ioloop.IOLoop.instance().start()
	except:
		pass

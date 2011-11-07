#!/usr/bin/env python

#!/usr/bin/env python

import urllib2, cookielib, json
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class cwebservices(object):
	def __init__(self, host="127.0.0.1", port=8082, logging_level=logging.DEBUG):

		self.logger = logging.getLogger('cwebservice')
		self.logger.setLevel(logging_level)

		self.logger.debug('Init urlib object ...')
		self.base_url = 'http://' + host + ':' + str(port)

		self.jar = cookielib.CookieJar()
		self.jar.clear_session_cookies()

		self.handler = urllib2.HTTPCookieProcessor(self.jar)
		self.opener = urllib2.build_opener(self.handler)

		urllib2.install_opener(self.opener)

		self.is_login = False

	def get(self, uri, parsing=True):
		url = self.base_url + uri
		self.logger.debug(' + GET '+url)
		data = urllib2.urlopen(url).read()

		if parsing:
			self.logger.debug('   + Try to parse json Data ...')
			try:
				data_json = json.loads(str(data))
				data = data_json['data']
				state = data_json['success']
			except:
				self.logger.debug('     + Failed')
				raise Exception("Failed to parse response ...")

			if not state:
				raise Exception("Request marked failed by server ...")
			
			self.logger.debug('     + Success')
	
		return data

	def login(self, login, password):
		self.logger.debug("Login with '%s'" % login)
		self.get("/auth/" + login + "/" + password, False)

		#print self.get("/online")

		self.is_login = True

	def logout(self):
		self.logger.debug("Logout.")
		self.get("/logout", False)

	def __del__(self):
		if self.is_login:
			self.logout()


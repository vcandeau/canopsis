#!/usr/bin/env python

import signal, time, logging

class init(object):
	def __init__(self, name, level="INFO"):
		logging.basicConfig(level=level,
   			                format='%(asctime)s %(name)s %(levelname)s %(message)s',
 	 	 		            )
		self.logger = logging.getLogger(name)

	class handler(object):
		def __init__(self, logger):
			self.logger = logger
			self.RUN = 1

		def status(self):
			return self.RUN

		def signal_handler(self, signum, frame):
			self.logger.warning("Receive signal to stop daemon...")
			if self.callback:
				self.callback()
			self.RUN = 0

		def run(self, callback=None):
			self.callback = callback
			signal.signal(signal.SIGINT, self.signal_handler)
			signal.signal(signal.SIGTERM, self.signal_handler)

		def set(self, statut):
			self.RUN = statut

		def wait(self):
			while self.RUN:
				time.sleep(1)

	def get_logger(self, level="INFO"):
		if level == "INFO":
			self.level = logging.INFO
		elif level == "WARNING":
			self.level = logging.WARNING
		elif level == "ERROR":
			self.level = logging.ERROR
		elif level == "CRITICAL":
			self.level = logging.CRITICAL
		elif level == "EXCEPTION":
			self.level = logging.EXCEPTION
		else:
			self.level = logging.INFO
		self.logger.setLevel(logging.INFO)
		return self.logger

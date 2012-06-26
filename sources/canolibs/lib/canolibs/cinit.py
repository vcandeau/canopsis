#!/usr/bin/env python

import signal, time, logging

class cinit(object):
	class getHandler(object):
		def __init__(self, logger):
			self.logger = logger
			self.RUN = True

		def status(self):
			return self.RUN

		def signal_handler(self, signum, frame):
			self.logger.warning("Receive signal to stop daemon...")
			if self.callback:
				self.callback()
			self.stop()

		def run(self, callback=None):
			self.callback = callback
			signal.signal(signal.SIGINT, self.signal_handler)
			signal.signal(signal.SIGTERM, self.signal_handler)
			
		def stop(self):
			self.RUN = False

		def set(self, statut):
			self.RUN = statut

		def wait(self):
			while self.RUN:
				try:
					time.sleep(1)
				except:
					break
			self.stop()

	def getLogger(self, name, level="INFO", logging_level=None):
		if not logging_level:
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
			elif level == "DEBUG":
				self.level = logging.DEBUG
		else:
			self.level = logging_level
			
		logging.basicConfig(level=self.level,
   			                format='%(asctime)s %(name)s %(levelname)s %(message)s',
 	 	 		            )
		self.logger = logging.getLogger(name)
		return self.logger

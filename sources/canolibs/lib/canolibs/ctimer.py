#!/usr/bin/env python

import time
import logging

class ctimer(object):
	def __init__(self, logging_level=logging.DEBUG):
		self.started = False
		self.logger = logging.getLogger('timer')
		self.logger.setLevel(logging_level)
		pass

	def start(self):
		#self.logger.debug("Start timer")
		self.started = True
		self.starttime = time.time()

	def stop(self):
		if self.started:
			#self.logger.debug("Stop timer")
			self.endtime = time.time()
			self.elapsed = self.endtime - self.starttime
			self.logger.debug("Elapsed time: %f ms", self.elapsed * 1000)

		self.started = False

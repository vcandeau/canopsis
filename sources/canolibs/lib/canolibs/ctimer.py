#!/usr/bin/env python

import time
import logging

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class ctimer(object):
	def __init__(self, logging_level=logging.INFO):
		self.started = False
		self.logger = logging.getLogger('timer')
		self.logger.setLevel(logging_level)
		self.RUN = True

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

	def start_task(self, task, interval=1, count=None, *args, **kargs):
		i=0
		tcount = 0
		start = time.time()
		while self.RUN:
			task(*args, **kargs)
			if count:
				tcount +=1
				if tcount >= count:
					break

			derive = time.time() - (start + (i*interval))
			i+=1
			if i >= 100:
				start = start + (i*interval)
				i=0

			pause = ((start + (i*interval)) - time.time())
			if pause < 0:
				pause = 0
			try:
				time.sleep(pause)
			except:
				self.RUN = False

	def __del__(self):
		self.RUN = False

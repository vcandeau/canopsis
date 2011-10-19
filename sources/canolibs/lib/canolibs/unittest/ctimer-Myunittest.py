#!/usr/bin/env python

import unittest, logging
import time
from ctimer import ctimer

mytimer = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_1_Init(self):
		global mytimer
		mytimer = ctimer(logging_level=logging.DEBUG)

	def test_2_Start(self):
		mytimer.start()

	def test_3_Stop(self):
		time.sleep(1)
		mytimer.stop()
		if not (mytimer.elapsed > 0.9 and mytimer.elapsed < 1.1):
			raise Exception('Invalid elapsed time ...')

	def test_4_Task(self):
		def task(_id="defaultid", name='defaultname'):
			print time.time(), _id, name
			time.sleep(0.7)

		start = time.time()
		mytimer.start_task(task=task, interval=1, count=3, _id='myid', name='myname')
		stop = time.time()
		elaps = round(stop - start, 2)
		print "Start:", start, "Stop:", stop, "Elapsed:", elaps

		if elaps != 2.7:
			raise Exception('Invalid elapsed time ...')

		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	

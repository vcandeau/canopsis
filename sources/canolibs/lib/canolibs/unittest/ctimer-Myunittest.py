#!/usr/bin/env python

import unittest
import time
from ctimer import ctimer

mytimer = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_1_Init(self):
		global mytimer
		mytimer = ctimer()

	def test_2_Start(self):
		mytimer.start()

	def test_3_Stop(self):
		time.sleep(1)
		mytimer.stop()
		if not (mytimer.elapsed > 1 and mytimer.elapsed < 1.05):
			raise Exception('Invalid elapsed time ...')

		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	

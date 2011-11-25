#!/usr/bin/env python
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------

import unittest, sys

import logging
import time

from cstorage import cstorage
from cperfstore import cperfstore
from caccount import caccount

from ctimer import ctimer

perfstore = None

#NB_PERF = 1440 # 1 perf/min for 24 hours
#NB_PERF = 288 # 1 perf/5min for 24 hours
NB_PERF = 10
SLEEP=2
ID='test.id'
last = 0
#result = []
timer = ctimer(logging_level=logging.DEBUG)

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global perfstore
		perfstore = cperfstore(storage=storage, namespace='perfdata_test',logging_level=logging.DEBUG)
		self.test_99_Purge()

	def test_03_Put(self):
		global first, last
		ts = 60
		timer.start()
		first = int(time.time())
		for i in range(0,NB_PERF):
			last = int(time.time())
			perfstore.put(ID, "'ok'="+str((i*100)/NB_PERF)+".0%;98;95;0;100 'warn'=0%;0;0;0;100 'crit'=0%;0;0;0;100", checkts=False)			
			time.sleep(SLEEP)
			pass
		timer.stop()

		print " + Insert Speed:",int(NB_PERF / timer.elapsed),"records/s (%s records)" % NB_PERF

	def test_04_GetConfig(self):
		perfstore.get_config(ID)
		pass

	def test_05_Get(self):

		#         first              last		
		# data: 2-1-|-1-2-3-4-5-6-7-8-|-1-2
		# enc1:	        |---------|
		# enc2: |-------|
                # enc3:                   |-------|
		# enc4: |-------------------------|

		OFFSET = 2 * SLEEP
		enc1 = [ first	+ OFFSET , last	 - OFFSET ]
		enc2 = [ first	- OFFSET , first + OFFSET ]
		enc3 = [ last	- OFFSET , last	 + OFFSET ]
		enc4 = [ first	- OFFSET , last	 + OFFSET ]

		records =  perfstore.get(ID, 'ok', enc1[0], enc1[1])
		if len(records) != 6:
			raise Exception('ENC1 Invalid Get count ('+str(len(records))+', '+str(enc1)+') ...')

		records =  perfstore.get(ID, 'ok', enc2[0], enc2[1])
		if len(records) != 3:
			raise Exception('ENC2 Invalid Get count ('+str(len(records))+'), '+str(enc2)+') ...')

		records =  perfstore.get(ID, 'ok', enc3[0], enc3[1])
		if len(records) != 3:
			raise Exception('ENC3 Invalid Get count ('+str(len(records))+'), '+str(enc3)+') ...')

		records =  perfstore.get(ID, 'ok', enc4[0], enc4[1])
		if len(records) != 10:
			raise Exception('ENC4 Invalid Get count ('+str(len(records))+'), '+str(enc4)+') ...')

	def test_06_Rotate(self):
		#time.sleep(5)
		timer.start()
		perfstore.rotate()
		timer.stop()

	def test_07_GetCompressed(self):
		timer.start()
		self.test_05_Get()
		timer.stop()

	def test_99_Purge(self):
		#time.sleep(5)
		perfstore.purge('test.id')
		pass
		

	
if __name__ == "__main__":
	storage = cstorage(caccount(user="root", group="root"), namespace='perfdata')
	unittest.main(verbosity=2)
	



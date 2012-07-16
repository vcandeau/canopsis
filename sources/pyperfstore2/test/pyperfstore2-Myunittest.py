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

import unittest, sys,json
import logging
import time
import random

logging.basicConfig(level=logging.INFO,
	format='%(name)s %(levelname)s %(message)s',
)

import pyperfstore2
manager = None
name = 'nagios.Central.check.service.localhost9'

start = int(time.time())

class KnownValues(unittest.TestCase):
	def setUp(self):
		pass

	def test_01_Init(self):
		global manager
		manager = pyperfstore2.manager(logging_level=logging.DEBUG)
		
		manager.remove(name=name)

	def test_02_Push(self):
		global start
		
		manager.midnight = start
		
		for i in range(start, start+(60*60*1), 60):
			manager.push(name=name, value=33.6, timestamp=i)
			
		i+=60
		
		manager.midnight = i
		start = i
			
	def test_03_Rotate(self):
		manager.rotate(name=name, force=True)

	def test_04_Push(self):
		global start
		
		manager.midnight = start
		
		for i in range(start, start+(60*60*1), 60):
			manager.push(name=name, value=33.6, timestamp=i)
		
		i+=60
		
		manager.midnight = i
		start = i
		
	def test_05_Get_Meta(self):
		meta = manager.get_meta(name=name)
		print meta
		
	def test_99_Remove(self):
		#manager.remove(name=name)
		pass
		
	
if __name__ == "__main__":
	unittest.main(verbosity=2)

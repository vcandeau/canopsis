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
name = 'nagios.Central.check.service.localhost9.ping'
component = 'localhost9'
resource = 'ping'

meta_extra = {'dn': (component, resource) }

start = int(time.time())
stop = None
ut_start = int(time.time())
nb = 0

class KnownValues(unittest.TestCase):
	def setUp(self):
		pass

	def test_01_Init(self):
		global manager
		manager = pyperfstore2.manager(mongo_collection='unittest_perfdata2', dca_min_length=50, logging_level=logging.DEBUG)
		
		manager.store.drop()

	def test_02_Push(self):
		global start, nb
		
		manager.midnight = start
		
		for i in range(start, start+(60*60*1), 60):
			manager.push(name=name, value=33.6, timestamp=i, meta_data=meta_extra)
			nb+=1
			
		i+=60
		
		manager.midnight = i
		start = i
			
	def test_03_Rotate(self):
		manager.rotate(name=name)

	def test_04_Push(self):
		global start, nb
		
		manager.midnight = start
		
		for i in range(start, start+(60*60*1), 60):
			manager.push(name=name, value=33.6, timestamp=i)
			nb+=1
		
		i+=60
		
		manager.midnight = i
		start = i
		
		global stop
		stop = start
		
	def test_05_Functions(self):
		data = manager.find_meta()
		if data.count() != 1:
			raise Exception('Invalid meta count')
			
		if len(data[0]['c']) != 1:
			raise Exception('Invalid rotation')
			
		data = manager.find_dca(name=name)
		if data.count() != 1:
			raise Exception('Invalid dca count')
			
	def test_06_Get_Meta(self):
		meta = manager.get_meta(name=name)
		print "Meta: %s" % meta
		if not meta:
			raise Exception('Invalid Meta !')
			
	def test_07_Get_point(self):
		points = manager.get_points(name=name, tstart=ut_start, tstop=stop)
		print "Total: %s" % nb
		print "Nb points: %s" % len(points)
		
		if len(points) != nb:
			raise Exception('Invalid points count')
			
		points = manager.aggregate(points, max_points=50, atype='MEAN', mode='by_point')
		
		print "Nb points: %s" % len(points)
		
	def test_08_ShowAll(self):
		manager.showStats()
		manager.showAll()
		
		
	def test_99_Remove(self):
		manager.remove(name=name)
		meta = manager.get_meta(name=name)
		
		if meta:
			raise Exception('Impossible to delete')
		
		#manager.store.drop()
		
	
if __name__ == "__main__":
	unittest.main(verbosity=2)

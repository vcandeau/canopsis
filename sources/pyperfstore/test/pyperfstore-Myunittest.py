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
import random

import pyperfstore

from pyperfstore import filestore
from pyperfstore import memstore
from pyperfstore import node
from pyperfstore import metric
from pyperfstore import dca

logging.basicConfig(level=logging.INFO,
	format='%(name)s %(levelname)s %(message)s',
)

mynode = None
storage = None
timestamp = None
refvalues = [ ]
refvalues.append([0, 0])

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global mynode, storage, timestamp
		#storage = filestore(base_path="/tmp/")
		storage = memstore()
		mynode = node('nagios.Central.check.service.localhost9', point_per_dca=100, storage=storage)

		timestamp = 1

	def test_02_PushValue(self):
		global timestamp, refvalues
		# 1 value / 5 min = 8928 values/month = 107136 values/year
		interval = 1
		nb = 1000
		for i in range(1,nb):
			
			value = random.random()
			mynode.metric_push_value(dn='load1', value=value, timestamp=timestamp)
			refvalues.append([timestamp, value])

			mynode.metric_push_value(dn='load5', value=random.random(), timestamp=timestamp)
			mynode.metric_push_value(dn='load15', value=random.random(), timestamp=timestamp)

			timestamp += interval

		mynode.pretty_print()

	def test_03_Load(self):
		global mynode

		dump1 = mynode.dump()

		metric1 =  mynode.metric_dump('load1')

		del mynode

		mynode = node('nagios.Central.check.service.localhost9', storage=storage)	

		dump2 = mynode.dump()
		metric2 =  mynode.metric_dump('load1')

		del dump1['writetime']
		del dump2['writetime']

		del metric1['writetime']
		del metric2['writetime']

		if dump1 != dump2:
			print "First:"
			print dump1
			print "Second:"
			print dump2
			raise Exception('Invalid load of nodes...')

		if metric1 != metric2:
			print "First:"
			print metric1
			print "Second:"
			print metric2
			raise Exception('Invalid load of metrics ...')

	def test_04_Second_PushValue(self):
		self.test_02_PushValue()

		print ""
		mynode.pretty_print()
		pass


	def test_05_GetValues(self):
		last = timestamp - 1

		print "Last: %s" % last

		## Get first 100 values
		start = time.time()
		values = mynode.metric_get_values('load1', 1, 100)
		print " + 100 Old values in %s ms" % ((time.time() - start) * 1000)

		if len(values) != 100:
			print "Count: %s" % len(values)
			raise Exception('Invalid Old count')

		if values != refvalues[1:100+1]:
			print values
			print refvalues[1:100+1]
			raise Exception('Invalid Old Data')


		## Get last 100 values
		start = time.time()
		values = mynode.metric_get_values('load1', last-99, last)
		print " + 100 Recent values in %s ms" % ((time.time() - start) * 1000)

		if len(values) != 100:
			print "Count: %s" % len(values)
			raise Exception('Invalid Recent count')

		
		if values != refvalues[last-99:last+1]:
			print values
			print refvalues[last-99:last+1]
			raise Exception('Invalid Recent Data')

		## Get middle 100 values
		start = time.time()
		values = mynode.metric_get_values('load1', last-499, last-400)
		print " + 100 Middle values in %s ms" % ((time.time() - start) * 1000)

		if len(values) != 100:
			print "Count: %s" % len(values)
			raise Exception('Invalid Middle count')

		
		if values != refvalues[last-499:last-400+1]:
			print values
			print refvalues[last-499:last-400+1]
			raise Exception('Invalid Middle Data')

	def test_06_aggregate(self):
		##### DRAFT !
		values = mynode.metric_get_values('load1', 1, 100)
		values = pyperfstore.math.aggregate(values, max_points=50)

		if len(values) != 50:
			raise Exception('Invalid aggregate (len: %s)' % len(values))



	def test_99_Remove(self):
		global mynode

		mynode.metric_remove('load1')
		mynode.metric_remove_all()

		mynode.remove()
		del mynode



if __name__ == "__main__":
	unittest.main(verbosity=2)

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

import time
import random
import logging

import pyperfstore
pyperfstore.logging_level = logging.ERROR

from pyperfstore import node
from pyperfstore import metric
from pyperfstore import dca

from pyperfstore import filestore
from pyperfstore import memstore
from pyperfstore import mongostore


def bench_store(store, nb=3000):
	print "Start Bench ..."
	mynode = node('nagios.Central.check.service.localhost9', storage=store)

	# 1 value / 5 min = 8928 values/month = 107136 values/year
	timestamp = int(time.time())
	#timestamp = 1
	bench_start = timestamp
	
	start = time.time()
	for i in range(1,nb+1):
		mynode.metric_push_value(dn='load1', unit=None, value=random.random(), timestamp=timestamp)
		mynode.metric_push_value(dn='load5', unit=None, value=random.random(), timestamp=timestamp)
		mynode.metric_push_value(dn='load15', unit=None, value=random.random(), timestamp=timestamp)

		timestamp += 300

	bench_stop = timestamp

	nb = nb * 3
	elapsed = time.time() - start
	print " + WRITE:"
	print "    + %s values in %s seconds" % ( nb, elapsed)
	print "    + %s values per second" % (int(nb/elapsed))
	print ""


	start = time.time()

	tstart = bench_start+1000
	tstop = bench_stop-350

	print "Get values between %s and %s" % (tstart, tstop)
	values = mynode.metric_get_values('load1', tstart, tstop)

	nb = len(values)

	elapsed = time.time() - start
	print " + READ:"
	print "    + %s values in %s seconds" % ( nb, elapsed)
	print "    + %s values per second" % (int(nb/elapsed))
	print ""

	start = time.time()

	mynode.remove()

	elapsed = time.time() - start
	print " + REMOVE:"
	print "    + %s seconds" % elapsed
	print ""


print "Mongo Store"
storage = mongostore(mongo_safe=False)
bench_store(storage)

print "Files Store"
storage = filestore(base_path="/tmp/data")
bench_store(storage)

print "Memory Store"
storage = memstore()
bench_store(storage)

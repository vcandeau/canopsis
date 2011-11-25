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

import unittest

from cavailability import cavailability

from crecord import crecord
from caccount import caccount
from cstorage import cstorage

import hashlib

STORAGE = None
AVAILABILITY = None
ID = None
class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_InitPutGet(self):
		global AVAILABILITY 
		AVAILABILITY = cavailability(name="myavailability", namespace='unittest', storage=STORAGE)
		AVAILABILITY.nocache = True

		_id = AVAILABILITY._id

		## Put in db
		STORAGE.put(AVAILABILITY)
		record = STORAGE.get(_id)

		## Load
		AVAILABILITY = cavailability(name="myavailability", storage=STORAGE)
		AVAILABILITY = cavailability(_id=_id, storage=STORAGE)
		AVAILABILITY = cavailability(record=record, storage=STORAGE)
		
		

	def test_02_PutData(self):
		global ID
		record1 = crecord({'_id': 'check1', 'check': 'test1', 'state': 0})
		record2 = crecord({'_id': 'check2', 'check': 'test2', 'state': 0})
		record3 = crecord({'_id': 'check3', 'check': 'test3', 'state': 0})

		STORAGE.put([record1, record2, record3])
		ID = record2._id


	def test_03_state(self):
		AVAILABILITY.mfilter = {}
		AVAILABILITY.mids = []
		AVAILABILITY.resolv()

		if AVAILABILITY.state != 0:
			raise Exception('Invalid ok state (%s) ...' % AVAILABILITY.state)

		STORAGE.put(crecord({'check': 'test4', 'state': 1}))

		AVAILABILITY.resolv()
		if AVAILABILITY.state != 1:
			raise Exception('Invalid warning state (%s) ...' % AVAILABILITY.state)

		STORAGE.put(crecord({'check': 'test5', 'state': 2}))

		AVAILABILITY.resolv()
		if AVAILABILITY.state != 2:
			raise Exception('Invalid critical state (%s) ...' % AVAILABILITY.state)


	def test_04_calcul_current(self):
		AVAILABILITY.mfilter = {}
		AVAILABILITY.resolv()

		STORAGE.put(crecord({'_id': 'check1',  'source_type': 'service', 'state': 0, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check2',  'source_type': 'service', 'state': 0, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check3',  'source_type': 'service', 'state': 1, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check4',  'source_type': 'service', 'state': 1, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check5',  'source_type': 'service', 'state': 1, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check6',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check7',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check8',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check9',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check10',  'source_type': 'service', 'state': 2, 'state_type': 1}))

		(current, current_pct) = AVAILABILITY.get_current_availability()
		## current_pct: {u'warning': 30.0, u'ok': 20.0, u'critical': 50.0}

		if current_pct['ok'] != 20:
			raise Exception('Invalid pct calculation ...')

	def test_05_Remove(self):
		STORAGE.remove(AVAILABILITY)

	def test_99_DropNamespace(self):
		STORAGE.drop_namespace('unittest')


if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=2)
	



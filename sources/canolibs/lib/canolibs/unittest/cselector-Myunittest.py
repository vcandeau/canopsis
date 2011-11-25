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

from cselector import cselector
#from cselector import cselector_get, cselector_getall

from crecord import crecord
from caccount import caccount
from cstorage import cstorage

import hashlib

STORAGE = None
SELECTOR = None
ID = None
class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_InitPutGet(self):
		global SELECTOR 
		SELECTOR = cselector(name="myselector", namespace='unittest', storage=STORAGE)
		SELECTOR.nocache = True

		_id = SELECTOR._id

		## Put in db
		STORAGE.put(SELECTOR)
		record = STORAGE.get(_id)

		## Load
		SELECTOR = cselector(name="myselector", storage=STORAGE)
		SELECTOR = cselector(_id=_id, storage=STORAGE)
		SELECTOR = cselector(record=record, storage=STORAGE)
		
		

	def test_02_PutData(self):
		global ID
		record1 = crecord({'_id': 'check1', 'check': 'test1', 'state': 0})
		record2 = crecord({'_id': 'check2', 'check': 'test2', 'state': 0})
		record3 = crecord({'_id': 'check3', 'check': 'test3', 'state': 0})

		STORAGE.put([record1, record2, record3])
		ID = record2._id

	def test_03_Resolv(self):
		SELECTOR.mfilter = {'$or': [ {'check': 'test1'},  {'check': 'test2'}] }
		records = SELECTOR.resolv()
		if len(records) != 2:
			raise Exception('Error in selector resolving ...')


		SELECTOR.mids = ['check3']
		records = SELECTOR.resolv()
		if len(records) != 3:
			raise Exception('Error in selector resolving ...')

	def test_04_Cat(self):
		SELECTOR.cat()

	def test_05_Match(self):
		if not SELECTOR.match('check1'):
			raise Exception('Error in match, plain id ...')

		if SELECTOR.match('toto'):
			raise Exception('Error in match, wrong id ...')

		if not SELECTOR.match(ID):
			raise Exception('Error in match, objectid ...')

	def test_08_Remove(self):
		STORAGE.remove(SELECTOR)

	def test_99_DropNamespace(self):
		STORAGE.drop_namespace('unittest')


if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=1)
	



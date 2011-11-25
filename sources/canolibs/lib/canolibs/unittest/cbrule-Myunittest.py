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

from caccount import caccount
from cstorage import cstorage
from crecord import crecord

from cbrule import cbrule

BRULE = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global BRULE
		
		record1 = crecord({'_id': 'check1', 'check': 'test1', 'state': 0})
		record2 = crecord({'_id': 'check2', 'check': 'test2', 'state': 0})
		record3 = crecord({'_id': 'check3', 'check': 'test3', 'state': 0})

		STORAGE.put([record1, record2, record3])

		BRULE = cbrule(name='myunittest', namespace='unittest', mids=['check1', 'check2'], storage=STORAGE)

	def test_02_SaveLoad(self):
		pass
	

	def test_03_SaveLoad(self):
		global BRULE
		BRULE.save()
		BRULE = None
		BRULE = cbrule(name='myunittest', namespace='unittest', storage=STORAGE)
		

		
	def test_99_Remove(self):
		STORAGE.drop_namespace('unittest')
		pass

if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=1)
	



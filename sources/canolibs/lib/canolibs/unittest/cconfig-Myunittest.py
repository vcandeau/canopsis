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

import unittest, logging

from cconfig import cconfig
from caccount import caccount
from cstorage import get_storage

config = None
root_account = caccount(user="root", group="root")
storage = get_storage(namespace='unittest')

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global config
		config = cconfig(name="testconfig", storage=storage, logging_level=logging.DEBUG)

	def test_02_Set(self):
		config.set('set', 'test')
		config.setstring('string', 'tata')
		config.setint('int', 9)
		config.setfloat('float', 5.6)
		config.setbool('bool', True)

		config.cat()

	def test_03_Save(self):
		config.save()

	def test_04_Get(self):
		config = cconfig(name="testconfig", account=root_account, storage=storage)

		#config.cat()
		
		myset = config.get('set')
		mystring = config.getstring('string')
		myint = config.getint('int')
		myfloat = config.getfloat('float')
		mybool = config.getbool('bool')

		if myset != 'test':
			raise Exception('Invalid set ...')

		if mystring != 'tata':
			raise Exception('Invalid string ...')

		if myint != 9:
			raise Exception('Invalid int ...')

		if myfloat != 5.6:
			raise Exception('Invalid float ...')

		if mybool != True:
			raise Exception('Invalid bool ...')

		if config.getint('novar') != 0:
			raise Exception('Invalid default int ...')

		if config.getint('novar', 5) != 5:
			raise Exception('Invalid default int ...')

	def test_99_Remove(self):
		storage.remove(config)

if __name__ == "__main__":
	unittest.main(verbosity=1)
	



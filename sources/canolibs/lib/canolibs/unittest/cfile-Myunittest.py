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

from cfile import cfile
from caccount import caccount
from cstorage import cstorage

class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.anonymous_account = caccount()
		self.root_account = caccount(user="root", group="root")
		self.storage = cstorage(self.root_account, namespace='unittest')
		self.data = {}

		self.my_file = '/opt/canopsis/bin/pydoc'
		self.my_data = 'JAMBON123'

	def test_01_Init(self):
		file = cfile()
		if file.data != self.data:
			raise Exception('Data corruption ...')

	def test_02_Givefile(self):
		global file
		file = cfile(storage=self.storage)
		file.put_file(self.my_file)

		if file.data['bin_data'] != open(self.my_file,'r').read():
			raise Exception('Data corruption ...')

	def test_03_Givedata(self):
		global data
		data = cfile(storage=self.storage)
		data.put_data(self.my_data)

		if data.data['bin_data'] != self.my_data:
			raise Exception('Data corruption ...')

	def test_04_Putfile(self):
		global meta_file_id
		meta_file_id = self.storage.put(file)

	def test_05_Putdata(self):
		global meta_data_id
		meta_data_id = self.storage.put(data)

	def test_06_GetMetaFromFile(self):
		global file_meta
		file_meta = self.storage.get(meta_file_id)

	def test_07_GetMetaFromData(self):
		global data_meta
		data_meta = self.storage.get(meta_data_id)

	def test_08_GetDataFromFile(self):
		global file_data
		file_meta.__class__ = cfile
		file_data = file_meta.get(self.storage)

	def test_09_GetDataFromData(self):
		global data_data
		data_meta.__class__ = cfile
		data_data = data_meta.get(self.storage)

	def test_10_RemoveFile(self):
		file_meta.remove(self.storage)		

	def test_11_RemoveData(self):
		data_meta.remove(self.storage)

	def test_12_CheckFileRemove(self):
		if file_meta.check(self.storage):
			raise Exception('Data not deleted ...')

	def test_13_CheckDataRemove(self):
		if data_meta.check(self.storage):
			raise Exception('Data not deleted ...')

if __name__ == "__main__":
	unittest.main(verbosity=1)

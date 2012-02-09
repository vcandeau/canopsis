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
from crecord import crecord

class cfile(crecord):
	def __init__(self, *args, **kargs):
		crecord.__init__(self, *args, **kargs)
		self.type = 'bin'

	def put_data(self, bin_data, file_name=None, content_type=None):
		self.data['bin_data'] = bin_data
		self.data['file_name'] = file_name
		self.data['content_type'] = content_type 

	def put_file(self, path, file_name=None, content_type=None):
		self.data['bin_data'] = open(path,'r').read()
		self.data['file_name'] = file_name
		self.data['content_type'] = content_type 
	
	def get(self, storage):
		self.storage = storage
		return self.storage.get_data(self.data['data_id'])

	def remove(self, storage):
		self.storage = storage
		self.storage.remove_data(self.data['data_id'])
		self.storage.remove(self._id)

	def check(self, storage):
		self.storage = storage
		return self.storage.check_data(self.data['data_id'])

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

from cgroup import cgroup
from caccount import caccount
from cstorage import cstorage

STORAGE = None
ACCOUNT = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass
		
	def test_01_Init(self):
		global ACCOUNT
		ACCOUNT = caccount(user="wpain", lastname="Pain", firstname="William", mail="wpain@capensis.fr", group="capensis")
		global GROUP
		GROUP = cgroup(name='group_name')
	
	def test_02_Cat(self):
		GROUP.cat()
		
	def test_03_add_accounts(self):
		GROUP.add_accounts(ACCOUNT)
		dump = GROUP.dump()
		if len(dump['account_ids']) != 1:
			raise Exception('Error while add_accounts, account not added')
			
	def test_04_Store(self):
		STORAGE.put(GROUP)
		GROUP.cat()
		
	def test_05_CheckGet(self):
		record = STORAGE.get("group.group_name")
		record.cat()
		GROUP = cgroup(record)
		GROUP.cat()
		
		if len(GROUP.account_ids) != 1:
			raise Exception('group.account_ids: Corruption in load...')
		
	def test_06_remove_accounts(self):
		GROUP.remove_accounts(ACCOUNT)
		dump = GROUP.dump()
		if len(dump['account_ids']) != 0:
			raise Exception('Error while remove_accounts, account not removed')
	
	def test_07_Remove(self):
		STORAGE.remove(ACCOUNT)
		
	def test_99_DropNamespace(self):
		STORAGE.drop_namespace('unittest')
		

if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=2)
	
		

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
from caccount import caccount_get, caccount_getall
from cgroup import cgroup

from cstorage import cstorage

import hashlib, time

STORAGE = None
ACCOUNT = None
GROUP = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global ACCOUNT
		ACCOUNT = caccount(user="wpain", lastname="Pain", firstname="William", mail="wpain@capensis.fr", group="capensis", groups=['titi', 'tata'])
		global GROUP

	def test_02_Cat(self):
		ACCOUNT.cat()

	def test_03_Passwd(self):
		passwd = 'root'
		ACCOUNT.passwd(passwd)

		shadow = ACCOUNT.make_shadow(passwd)
		if not ACCOUNT.check_shadowpasswd(shadow):
			raise Exception('Invalid shadow passwd ... (%s)' % shadow )

		if not ACCOUNT.check_passwd(passwd):
			raise Exception('Invalid passwd ... (%s)' % passwd)

		authkey = ACCOUNT.make_tmp_cryptedKey()
		if not ACCOUNT.check_tmp_cryptedKey(authkey):
			raise Exception('Invalid authkey ... (%s)' % authkey)		
		
		ACCOUNT.cat()

	def test_04_Store(self):
		STORAGE.put(ACCOUNT)
		ACCOUNT.cat()
	"""
	def test_05_GetAll(self):
		account = caccount(user="ojan", lastname="Jan", firstname="Olivier", mail="ojan@capensis.fr", group="capensis")
		STORAGE.put(account)

		accounts = caccount_getall(STORAGE)

		if len(accounts) != 2:
			raise Exception('caccount_getall dont work ...')
	"""
	def test_06_Edit(self):
		ACCOUNT.chgrp('toto')
		ACCOUNT.cat()
		STORAGE.put(ACCOUNT)

	def test_07_CheckGet(self):
		record = STORAGE.get("account.wpain")
		record.cat()
		account = caccount(record)
		account.cat()

		if account.user != 'wpain':
			raise Exception('account.user: Corruption in load ...')

		if account.group != 'toto':
			raise Exception('account.group: Corruption in load ...')

		if account.groups != ['titi', 'tata']:
			raise Exception('account.groups: Corruption in load ...')
		

	def test_08_CheckEdit(self):
		account = caccount_get(STORAGE, "wpain")

		if account.group != 'toto':
			raise Exception('Impossible to edit account in DB ...')

	def test_09_Remove(self):
		## Anonymous cant remove account
		self.assertRaises(ValueError, STORAGE.remove, ACCOUNT, caccount())

		## But root can ;)
		STORAGE.remove(ACCOUNT)
		
	def test_10_check_addgroup_removegroup(self):
		GROUP = cgroup(name='mygroup')
		ACCOUNT.add_in_groups(GROUP)
		
		if GROUP._id not in ACCOUNT.groups:
			raise Exception('Error while add_in_groups, group not added')
		if ACCOUNT._id not in GROUP.account_ids:
			raise Exception('Error while add_in_groups, account not added to group')
			
		ACCOUNT.remove_from_groups(GROUP)
		
		if GROUP._id in ACCOUNT.groups:
			raise Exception('Error while remove_from_groups, group not removed')
		if ACCOUNT._id in GROUP.account_ids:
			raise Exception('Error while remove_from_groups, group not removed from account')
		
	def test_11_check_group_func_autosav(self):
		account = caccount(user='test', lastname='testify', storage=STORAGE)
		group = cgroup(name='Mgroup')
		
		#print(group.dump())
		
		STORAGE.put(account)
		STORAGE.put(group)
		
		#print('THE STORAGE IS %s' % account.storage)
		#print('CGROUP NAME IS : %s' % group._id)
		account.add_in_groups(group._id)

		print(STORAGE.get(group._id))
		
		bdd_account = caccount(STORAGE.get(account._id))
		bdd_group = cgroup(STORAGE.get(group._id))
		
		print(bdd_account.dump())
		print(bdd_group.dump())
		
		if group._id not in bdd_account.groups:
			raise Exception('Group corruption while stock in bdd')
		if account._id not in bdd_group.account_ids:
			raise Exception('Group corruption while stock in bdd')
			
	def test_99_DropNamespace(self):
		STORAGE.drop_namespace('unittest')

if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=2)
	



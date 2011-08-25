#!/usr/bin/env python

import unittest

from caccount import caccount
from caccount import caccount_get, caccount_getall

from cstorage import cstorage


import hashlib

STORAGE = None
ACCOUNT = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global ACCOUNT
		ACCOUNT = caccount(user="wpain", lastname="Pain", firstname="William", mail="wpain@capensis.fr", group="capensis")

	def test_02_Cat(self):
		ACCOUNT.cat()

	def test_03_Passwd(self):
		ACCOUNT.passwd('mypassword')

		shadow = hashlib.sha1(repr('mypassword')).hexdigest()
		if not ACCOUNT.check_passwd(shadow):
			raise Exception('Invalid passwd ...')

	def test_04_Store(self):
		STORAGE.put(ACCOUNT)

	def test_05_GetAll(self):
		account = caccount(user="ojan", lastname="Jan", firstname="Olivier", mail="ojan@capensis.fr", group="capensis")
		STORAGE.put(account)

		accounts = caccount_getall(STORAGE)

		if len(accounts) != 2:
			raise Exception('caccount_getall dont work ...')

	def test_06_Edit(self):
		ACCOUNT.chgrp('toto')
		STORAGE.put(ACCOUNT)

	def test_07_CheckEdit(self):
		account = caccount_get(STORAGE, "wpain")

		if account.group != 'toto':
			raise Exception('Impossible to edit account in DB ...')

	def test_08_Remove(self):
		## Anonymous cant remove account
		self.assertRaises(ValueError, STORAGE.remove, ACCOUNT, caccount())

		## But root can ;)
		STORAGE.remove(ACCOUNT)

if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=1)
	



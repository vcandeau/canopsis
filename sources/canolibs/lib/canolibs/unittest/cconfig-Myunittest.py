#!/usr/bin/env python

import unittest

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
		config = cconfig(name="testconfig", account=root_account, storage=storage)

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
	



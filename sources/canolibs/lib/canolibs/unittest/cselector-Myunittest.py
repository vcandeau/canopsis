#!/usr/bin/env python

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

	def test_01_Init(self):
		global SELECTOR 
		SELECTOR = cselector(name="myselector", storage=STORAGE)

	def test_02_PutData(self):
		global ID
		record1 = crecord({'_id': 'check1', 'check': 'test1'})
		record2 = crecord({'check': 'test2'})
		record3 = crecord({'check': 'test3'})

		STORAGE.put([record1, record2, record3])
		ID = record2._id

	def test_03_Resolv(self):
		SELECTOR.set_filter({'$or': [ {'check': 'test1'},  {'check': 'test2'}] })
		records = SELECTOR.resolv()
		if len(records) != 2:
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

	def test_06_Remove(self):
		STORAGE.remove(SELECTOR)

	def test_99_DropNamespace(self):
		STORAGE.drop_namespace('unittest')


if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=1)
	



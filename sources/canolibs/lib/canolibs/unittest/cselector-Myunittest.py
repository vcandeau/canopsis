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
		SELECTOR.nocache = True

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

	def test_06_state(self):
		SELECTOR.mfilter = {}
		SELECTOR.mids = []
		SELECTOR.resolv()

		if SELECTOR.state != 0:
			raise Exception('Invalid ok state (%s) ...' % SELECTOR.state)

		STORAGE.put(crecord({'check': 'test4', 'state': 1}))

		SELECTOR.resolv()
		if SELECTOR.state != 1:
			raise Exception('Invalid warning state (%s) ...' % SELECTOR.state)

		STORAGE.put(crecord({'check': 'test5', 'state': 2}))

		SELECTOR.resolv()
		if SELECTOR.state != 2:
			raise Exception('Invalid critical state (%s) ...' % SELECTOR.state)


	def test_07_calcul_current(self):
		SELECTOR.mfilter = {}
		SELECTOR.resolv()

		STORAGE.put(crecord({'_id': 'check1',  'source_type': 'service', 'state': 0, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check2',  'source_type': 'service', 'state': 0, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check3',  'source_type': 'service', 'state': 1, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check4',  'source_type': 'service', 'state': 1, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check5',  'source_type': 'service', 'state': 1, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check6',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check7',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check8',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check9',  'source_type': 'service', 'state': 2, 'state_type': 1}))
		STORAGE.put(crecord({'_id': 'check10',  'source_type': 'service', 'state': 2, 'state_type': 1}))

		(current, current_pct) = SELECTOR.get_current_availability()
		## current_pct: {u'warning': 30.0, u'ok': 20.0, u'critical': 50.0}

		if current_pct['ok'] != 20:
			raise Exception('Invalid pct calculation ...')

	def test_08_Remove(self):
		STORAGE.remove(SELECTOR)

	def test_99_DropNamespace(self):
		STORAGE.drop_namespace('unittest')


if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')
	unittest.main(verbosity=1)
	



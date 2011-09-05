#!/usr/bin/env python

import unittest

from crecord import crecord
from caccount import caccount

#storage = cstorage.


class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.anonymous_account = caccount()
		self.root_account = caccount(user="root", group="root")
		self.user_account = caccount(user="william", group="capensis")

		self.data = {'mydata1': 'data1', 'mydata2': 'data2', 'mydata3': 'data3'}

	def test_01_Init(self):
		record = crecord(self.data)
		if record.data != self.data:
			raise Exception('Data corruption ...')

	def test_02_InitFromRaw(self):
		raw = {'crecord_name': 'titi', 'aaa_access_group': ['r'], 'aaa_access_owner': ['r', 'w'], 'aaa_group': None, 'aaa_access_unauth': [], 'aaa_owner': None, 'aaa_access_other': [], 'mydata1': 'data1', 'mydata3': 'data3', 'mydata2': 'data2', 'crecord_type': 'raw', 'crecord_write_time': None}

		record = crecord(raw_record=raw)
		if record.data != self.data:
			raise Exception('Data corruption ...')

	def test_03_InitFromRecord(self):
		record = crecord(self.data)

		record2 = crecord(record=record)
		if record2.data != self.data:
			raise Exception('Data corruption ...')

	def test_04_ChOwnGrp(self):
		record = crecord(self.data)

		record.chown('toto')
		if record.owner != 'toto':
			raise Exception('chown dont work ...')

		record.chgrp('tata')
		if record.group != 'tata':
			raise Exception('chgrp dont work ...')

		#record.chown(self.user_account)
		#if record.owner != 'william' and record.group != 'capensis':
		#	raise Exception('chown with caccount dont work ...')
		
	def test_05_Chmod(self):
		record = crecord({'check': 'bidon'})

		record.chmod('u-w')
		record.chmod('u-r')
		record.chmod('u+w')

		if record.access_owner != ['w']:
			raise Exception('Chmod not work on "owner" ...')
		
		record.chmod('g-w')
		record.chmod('g-r')
		record.chmod('g+w')

		if record.access_group != ['w']:
			raise Exception('Chmod not work on "group" ...')
	
		
if __name__ == "__main__":
	unittest.main(verbosity=1)
	



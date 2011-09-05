#!/usr/bin/env python

import unittest

from cstorage import cstorage
from crecord import crecord
from caccount import caccount

import logging
import time
#storage = cstorage.

STORAGE = None
MYRECORD = None
ID = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.anonymous_account = caccount()
		self.root_account = caccount(user="root", group="root")
		self.user_account = caccount(user="william", group="capensis")

		self.data = {'mydata1': 'data1', 'mydata2': 'data2', 'mydata3': 'data3'}
		
	def test_01_Init(self):
		global STORAGE
		STORAGE = cstorage(self.user_account, namespace='unittest', logging_level=logging.DEBUG)

		records = STORAGE.find(account=self.root_account)
		STORAGE.remove(records, account=self.root_account)

	def test_02_CreateRecord(self):
		global MYRECORD
		MYRECORD = crecord(self.data, storage=STORAGE)

	def test_03_Put(self):
		global ID
		ID = STORAGE.put(MYRECORD)

	def test_04_RecordSave(self):
		MYRECORD.save(STORAGE)
		MYRECORD.save()

	def test_05_Get(self):
		global MYRECORD
		MYRECORD = STORAGE.get(ID)
		if MYRECORD.data != self.data:
			raise Exception('Invalid data ...')

	def test_06_UpdateAndPut(self):
		MYRECORD.data['mydata4'] = 'data4'
		STORAGE.put(MYRECORD)
		record = STORAGE.get(ID)
		record.cat()
		if record.data == self.data:
			raise Exception('Data not updated ...')

	def test_07_Remove(self):
		record1 = crecord({'check': 'remove1'})
		id1 = STORAGE.put(record1)
		record2 = crecord({'check': 'remove2'})
		id2 = STORAGE.put(record2)
		record3 = crecord({'check': 'remove3'})
		id3 = STORAGE.put(record3)

		STORAGE.remove([id1, id2, id3])

		STORAGE.remove(ID)

	def test_08_CheckRemove(self):
		self.assertRaises(KeyError, STORAGE.get, ID)

	def test_09_ManyInsert(self):
		record1 = crecord({'check': 'test1', 'state': 1})
		record2 = crecord({'check': 'test2', 'state': 0})
		record3 = crecord({'check': 'test3', 'state': 0})

		STORAGE.put([record1, record2, record3])

	def test_10_Find(self):
		records = STORAGE.find({'check': 'test1'})
		#for record in records:
		#	record.cat()

		if len(records) != 1:
			raise Exception('Error in filter ...')

	def test_11_Find_limit(self):
		records = STORAGE.find({}, limit=3)

		if len(records) != 3:
			raise Exception('Error in limit ...')

	def test_12_FindOne(self):
		record = STORAGE.find_one({'check': 'test1'})

		if not isinstance(record, crecord):
			raise Exception('Error in find_one ...')

	def test_13_CheckReadRights(self):
		# Inserts
		STORAGE.put(crecord({'check': 'test4'}), account=self.anonymous_account)
		STORAGE.put(crecord({'check': 'test5'}), account=self.anonymous_account)
		_id = STORAGE.put(crecord({'check': 'test6'}), account=self.root_account)

		## 3 records for user
		## 2 records for anonymous
		## 6 records for root

		records = STORAGE.find(account=self.user_account)
		if len(records) != 3:
			raise Exception('Invalid rigths for user account ...')

		records = STORAGE.find(account=self.anonymous_account)
		if len(records) != 2:
			raise Exception('Invalid rigths for anonymous account ...')

		self.assertRaises(KeyError, STORAGE.get, _id, self.anonymous_account)

		record = STORAGE.get(_id, account=self.root_account)
			
		records = STORAGE.find(account=self.root_account)
		if len(records) != 6:
			raise Exception('Invalid rigths for root account ...')
	

	def test_14_CheckWriteRights(self):
		# Insert with user account
		record = crecord({'check': 'test7'})
		STORAGE.put(record, account=self.user_account)
	
		## try to remove with anonymous account
		self.assertRaises(ValueError, STORAGE.remove, record, self.anonymous_account)

		## Change rights
		record.chgrp('anonymous')
		record.chmod('g+w')
		STORAGE.put(record)

		## try to remove with anonymous account
		STORAGE.remove(record, account=self.anonymous_account)
		

	def test_15_MapReduce(self):
		from bson.code import Code
	
		mmap = Code("function () {"
		"		if (this.state == 0){ emit('ok', 1) }"
		"		else if (this.state == 1){ emit('warning', 1) }"
		"		else if (this.state == 2){ emit('critical', 1) }"
		"		else if (this.state == 3){ emit('unknown', 1) }"
		"}")

		mreduce = Code("function (key, values) {"
		"  var total = 0;"
		"  for (var i = 0; i < values.length; i++) {"
		"    total += values[i];"
		"  }"
		"  return total;"
		"}")

		result = STORAGE.map_reduce({}, mmap, mreduce)

		if result['ok'] != 2 and result['warning'] != 1:
			raise Exception('Invalid map/reduce result ...')

	def test_16_tree(self):
		record1 = crecord(self.data)
		record2 = crecord(self.data)
		record3 = crecord(self.data)
		record4 = crecord(self.data)

		STORAGE.put([record1, record2, record3, record4])

		record1.add_children(record2)
		record1.add_children(record3)

		record2.add_children(record4)

		STORAGE.put([record1, record2])

		tree = STORAGE.get_tree(record1)
		print tree

	def test_17_RemoveAll(self):
		records = STORAGE.find(account=self.root_account)
		STORAGE.remove(records, account=self.root_account)
		pass

	def test_18_DropNamespace(self):
		STORAGE.drop_namespace('unittest')
		pass
		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	



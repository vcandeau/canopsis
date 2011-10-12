#!/usr/bin/env python

import unittest

from crecord_ng import crecord_ng
from caccount import caccount

#storage = cstorage.


class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.anonymous_account = caccount()
		self.root_account = caccount(user="root", group="root")
		self.user_account = caccount(user="william", group="capensis")

		self.data = {'mydata1': 'data1', 'mydata2': 'data2', 'mydata3': 'data3'}

	def test_01_InitPutGet(self):

		record = crecord_ng(data=self.data, name='unittest')

		record = crecord_ng(name='unittest')
		record.data = self.data
		record.save()
		
		record = crecord_ng(record=record)

		record = crecord_ng(name='unittest')

		if record.data != self.data:
			raise Exception('Data corruption ...')


		
if __name__ == "__main__":
	unittest.main(verbosity=1)
	



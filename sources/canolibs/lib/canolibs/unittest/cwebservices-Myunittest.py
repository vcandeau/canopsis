#!/usr/bin/env python

import unittest

from cwebservices import cwebservices

WS = None

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global WS
		WS = cwebservices()

	def test_02_Login(self):
		WS.login('root', 'root')

	def test_03_Rest(self):
		print WS.get("/rest/object/account")

	def test_99_Logout(self):
		WS.logout()
	
		
if __name__ == "__main__":
	unittest.main(verbosity=2)

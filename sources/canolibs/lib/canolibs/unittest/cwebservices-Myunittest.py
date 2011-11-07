#!/usr/bin/env python

import unittest

from cwebservices import cwebservices

WS = None

get_auth_uri = [
	# account
	'/account/me',
	'/account/',
	'/account/account.root',
	# rest
	'/rest/object',
	'/rest/object/account',
	'/rest/object/account/account.root',
	# ui_menu
	#'/ui/menu',
	# ui_view
	'/ui/dashboard',
	#'/ui/views', !!!!!!!!!!!
]

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global WS
		WS = cwebservices()

	def test_02_TestURL(self):
		for uri in get_auth_uri:
			success=False
			try:
				WS.get(uri)
				success=True
			except:
				pass
		
			if success:
				raise Exception("%s is open !" % uri)

	def test_03_Login(self):
		WS.login('root', 'root')

	def test_04_TestURLAuthed(self):
		WS.login('root', 'root')

		for uri in get_auth_uri:
			WS.get(uri)

	def test_99_Logout(self):
		WS.logout()
	
		
if __name__ == "__main__":
	unittest.main(verbosity=2)

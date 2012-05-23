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

#import logging
from crecord import crecord
from random import getrandbits
import hashlib, time

class caccount(crecord):
	def __init__(self, record=None, user=None, group=None, lastname=None, firstname=None, mail=None, groups=[], authkey=None, *args, **kargs):

		self.user = user
		self.owner = user
		self.group = group
		self.groups = groups
		self.shadowpasswd = None
		
		self.authkey = authkey

		self.lastname = lastname
		self.firstname = firstname
		self.mail = mail

		self.type = "account"

		if not self.user:
			self.user="anonymous"

		if not self.group:
			self.group ="anonymous"
			
		if not self.authkey:
			self.authkey = hashlib.sha224(str(getrandbits(512))).hexdigest()

		if self.user:
			self._id = self.type+"."+self.user	

		self.access_owner=['r','w']
		self.access_group=[]
		self.access_other=[]
		self.access_unauth=[]

		if isinstance(record, crecord):
			crecord.__init__(self, _id=self._id, record=record, type=self.type, *args, **kargs)
		else:
			crecord.__init__(self, _id=self._id, owner=self.user, group=self.group, type=self.type, *args, **kargs)



	def get_full_mail(self):
		return "\"%s %s\" <%s>" % (self.firstname, self.lastname, self.mail)

	def passwd(self, passwd):
		self.shadowpasswd = hashlib.sha1(str(passwd)).hexdigest()

	def check_passwd(self, passwd):
		return self.check_shadowpasswd(hashlib.sha1(str(passwd)).hexdigest())

	def check_shadowpasswd(self, shadowpasswd):
		shadowpasswd = str(shadowpasswd).upper()
		if shadowpasswd == str(self.shadowpasswd).upper():
			return True

		return False
		
	def make_shadow(self, passwd):
		return hashlib.sha1(str(passwd)).hexdigest()
	
	
	def check_tmp_cryptedKey(self, authkey):
		authkey =  str(authkey).upper()
		if authkey == str(self.make_tmp_cryptedKey(self.shadowpasswd)).upper():
			return True
		
		return False
		
	def make_tmp_cryptedKey(self, shadow=None):
		if not shadow:
			shadow = self.shadowpasswd
			
		return hashlib.sha1( str(shadow).upper() + str( int( time.time() / 10)*10 )  ).hexdigest()

	#def get_authkey

	def dump(self):
		self.name = self.user
		self.data['user'] = self.user
		self.data['lastname'] = self.lastname
		self.data['firstname'] = self.firstname
		self.data['mail'] = self.mail
		self.data['groups'] = list(self.groups)
		if self.group:
			self.data['groups'].insert(0, self.group)

		self.data['shadowpasswd'] = self.shadowpasswd
		self.data['authkey'] = self.authkey
		return crecord.dump(self)

	def load(self, dump):
		crecord.load(self, dump)
		self.user = self.data['user']
		self.lastname = self.data['lastname']
		self.firstname = self.data['firstname']
		self.mail = self.data['mail']
		self.groups = self.data['groups']

		if len(self.groups) > 0:
			if self.groups[0] == self.group:
				self.groups.pop(0)

		self.shadowpasswd = self.data['shadowpasswd']
		if 'authkey' in self.data:
			self.authkey = self.data['authkey']

	def cat(self):
		print "Id:\t", self._id
		print " + Fullname:\t", self.firstname, self.lastname
		print " + User:\t", self.user
		print " + Mail:\t", self.mail
		print " + Group:\t", self.group
		print " + Groups:\t", self.groups, "\n"


#################

def caccount_getall(storage):
	accounts = []
	records = storage.find({'crecord_type': 'account'})
	for record in records:
		accounts.append(caccount(record))
	
	return accounts

def caccount_get(storage, user):
	record = storage.get('account.'+user)
	account = caccount(record)
	return account
	

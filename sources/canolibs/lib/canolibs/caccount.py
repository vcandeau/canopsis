#!/usr/bin/env python

#import logging
from crecord import crecord
import hashlib

class caccount(crecord):
	def __init__(self, record=None, user=None, group=None, lastname=None, firstname=None, mail=None, groups=[], *args, **kargs):

		self.user = user
		self.owner = user
		self.group = group
		self.groups = groups
		self.shadowpasswd = None

		self.lastname = lastname
		self.firstname = firstname
		self.mail = mail

		self.type = "account"

		if not self.user:
			self.user="anonymous"

		if not self.group:
			self.group ="anonymous"

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



	def passwd(self, passwd):
		self.shadowpasswd = hashlib.sha1(str(passwd)).hexdigest()

	def check_passwd(self, passwd):
		return self.check_shadowpasswd(hashlib.sha1(str(passwd)).hexdigest())

	def check_shadowpasswd(self, shadowpasswd):
		if self.shadowpasswd == shadowpasswd:
			return True

		return False

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
	

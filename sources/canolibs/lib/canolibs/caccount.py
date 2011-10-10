#!/usr/bin/env python

#import logging
from crecord import crecord
import hashlib

class caccount(crecord):
	def __init__(self, record=None, user=None, group=None, lastname=None, firstname=None, mail=None, groups=[], *args):

		self.user = user
		self.owner = user
		self.group = group
		self.groups = groups
		self.shadowpasswd = None

		self.lastname = lastname
		self.firstname = firstname
		self.mail = mail

		if isinstance(record, crecord):
			crecord.__init__(self, raw_record=record.dump())
		else:
			crecord.__init__(self, owner=user, group=group, data = {}, *args)

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

		self.groups = groups


	def passwd(self, passwd):
		self.shadowpasswd = hashlib.sha1(repr(passwd)).hexdigest()

	def check_passwd(self, passwd):
		return self.check_shadowpasswd(hashlib.sha1(repr(passwd)).hexdigest())

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
		self.data['groups'] = self.groups
		self.data['shadowpasswd'] = self.shadowpasswd
		return crecord.dump(self)

	def load(self, dump):
		crecord.load(self, dump)
		self.user = self.data['user']
		self.lastname = self.data['lastname']
		self.firstname = self.data['firstname']
		self.mail = self.data['mail']
		self.groups = self.data['groups']
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
	

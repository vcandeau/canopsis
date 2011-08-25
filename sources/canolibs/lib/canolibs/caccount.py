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
			crecord.__init__(self, owner=user, group=group, *args)

		self.type = "account"

		if self.user:
			self._id = self.type+"-"+self.user	

		self.access_owner=['r','w']
		self.access_group=[]
		self.access_other=[]
		self.access_unauth=[]

		self.groups = groups

		if not self.user:
			self.user="anonymous"

		if not self.group:
			self.group ="anonymous"

	def passwd(self, passwd):
		self.shadowpasswd = hashlib.sha1(repr(passwd)).hexdigest()

	def check_passwd(self, shadowpasswd):
		if self.shadowpasswd:
			if self.shadowpasswd == shadowpasswd:
				return True

		return False

	def dump(self):
		dump = crecord.dump(self)
		dump['lastname'] = self.lastname
		dump['firstname'] = self.firstname
		dump['mail'] = self.mail
		dump['groups'] = self.groups
		dump['shadowpasswd'] = self.shadowpasswd
		return dump

	def load(self, dump):
		self.lastname = dump['lastname']
		self.firstname = dump['firstname']
		self.mail = dump['mail']
		self.groups = dump['groups']
		self.shadowpasswd = dump['shadowpasswd']

		del dump['lastname']
		del dump['firstname']
		del dump['mail']
		del dump['groups']
		del dump['shadowpasswd']
		
		crecord.load(self, dump)

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
	record = storage.get('account-'+user)
	account = caccount(record)
	return account
	

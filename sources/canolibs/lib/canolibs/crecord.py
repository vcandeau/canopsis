#!/usr/bin/env python

class crecord(object):
	def __init__(self, data = {}, owner=None, group=None, raw_record=None, storage=None):
		#if account:
		#	self.account = account
		#	self.owner=account.user
		#	self.group=account.group
		#else:
		#	self.owner=None
		#	self.group=None
		#	self.account=None

		self.write_time = None

		self.owner=owner
		self.group=group
		self.type= "raw"
		self.access_owner=['r','w']
		self.access_group=['r']
		self.access_other=[]
		self.access_unauth=[]

		try:
			self._id = data['_id']
			del data['_id']
		except:
			self._id = None

		self.data = data
		self.storage = storage

		if raw_record:
			self.load(raw_record)

	def load(self, dump):
		self.owner = dump['aaa_owner']
		self.group = dump['aaa_group']
		self.access_owner = dump['aaa_access_owner']
		self.access_group = dump['aaa_access_group']
		self.access_other = dump['aaa_access_other']
		self.access_unauth = dump['aaa_access_unauth']
		self.type = dump['crecord_type']
		self.write_time = dump['crecord_write_time']

		try:
			self._id = dump['_id']
			del dump['_id']
		except:
			self._id = None

		del dump['aaa_owner']
		del dump['aaa_group']
		del dump['aaa_access_owner']
		del dump['aaa_access_group']
		del dump['aaa_access_other']
		del dump['aaa_access_unauth']
		del dump['crecord_type']
		del dump['crecord_write_time']

		self.data = dump

	def save(self, storage=None):
		mystorage = None
		if storage:
			mystorage=storage
		elif self.storage:
			mystorage=self.storage

		if mystorage:
			mystorage.put(self)
		else:
			pass

	def dump(self):
		dump = self.data.copy()
		dump['_id'] = self._id
		dump['aaa_owner'] = self.owner
		dump['aaa_group'] = self.group
		dump['aaa_access_owner'] = self.access_owner
		dump['aaa_access_group'] = self.access_group
		dump['aaa_access_other'] = self.access_other
		dump['aaa_access_unauth'] = self.access_unauth
		dump['crecord_type'] = self.type
		dump['crecord_write_time'] = self.write_time
		return dump

	def cat(self):
		print "Id:\t", self._id
		print "Owner:\t", self.owner
		print "Group:\t", self.group
		print "Type:\t", self.type
		print "Writed:\t", self.write_time
		print "Access:"
		print "  Owner:\t", self.access_owner
		print "  Group:\t", self.access_group
		print "  Other:\t", self.access_other
		print "  Anonymous:\t", self.access_unauth
		print "Data:\n", self.data, "\n"

	def __str__(self):
		return str(self.dump())

	def check_write(self, account):
		if account:
			if account.user == 'root':
				return True
	
			elif ((account.user == self.owner) and ('w' in self.access_owner)):
				return True
			elif ((account.group == self.group) and ('w' in self.access_group)):
				return True

		return False
	
	def chown(self, owner):
		#if isinstance(owner, caccount):
		#	self.owner = owner.user
		#	self.group = owner.group
		#else:
		#	self.owner=owner

		self.owner=owner

	def chgrp(self, group):
		self.group = group

	def chmod(self, action):
		## g+w, g+r, u+r, u+w ...
		# u: user
		# g: group
		# o: other
		# a: anonymous
		if not (len(action) < 3):
			field = action[0]
			way = action[1]
			mod = action[2]
			access = None

			#print "Field:", field, "Way:", way, "Mod:", mod
			if   field == 'u':
				access = self.access_owner
			elif field == 'g':
				access = self.access_group
			elif field == 'o':
				access = self.access_other
			elif field == 'a':
				access = self.access_unauth

			#print "Before:", access
			if access != None:
				if   way == '+':
					if mod not in access:
						access.append(mod)
				elif way == '-':
					if mod in access:
						access.remove(mod)

			#print "After", action ,":", access
		else:
			raise ValueError("Invalid argument ...")



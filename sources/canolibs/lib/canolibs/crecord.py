#!/usr/bin/env python

class crecord(object):
	def __init__(self, data = {}, _id=None, name="noname", owner=None, group=None, raw_record=None, record=None, storage=None, account=None, type='raw'):
		self.write_time = None

		self.owner=owner
		self.group=group
		self.type= type
		self.access_owner=['r','w']
		self.access_group=['r']
		self.access_other=[]
		self.access_unauth=[]
		self.name = name
		self.parent = []
		self.children = []
		self.children_record = []
		self._id = _id

		if account:
			#self.account = account
			self.owner=account.user
			self.group=account.group

		try:
			self._id = data['_id']
			del data['_id']
		except:
			pass

		self.data = data.copy()
		self.storage = storage

		if   isinstance(record, crecord):
			self.load(record.dump())
		elif raw_record:
			self.load(raw_record)

	def load(self, dump):
		self.owner = str(dump['aaa_owner'])
		self.group = str(dump['aaa_group'])
		self.access_owner = dump['aaa_access_owner']
		self.access_group = dump['aaa_access_group']
		self.access_other = dump['aaa_access_other']
		self.access_unauth = dump['aaa_access_unauth']
		self.type = str(dump['crecord_type'])
		self.write_time = dump['crecord_write_time']
		self.name = str(dump['crecord_name'])
		self.children = dump['children']
		self.parent = dump['parent']

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
		del dump['crecord_name']
		del dump['children']
		del dump['parent']

		self.data = dump.copy()

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

	def dump(self, json=False):
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
		dump['crecord_name'] = self.name
	
		dump['parent'] =  self.parent
		dump['children'] =  self.children

		if json:
			dump['_id'] = str(self._id)

			items  = []
			for item in dump['parent']:
				items.append(str(item))
			dump['parent']  = list(items)

			items  = []
			for item in dump['children']:
				items.append(str(item))
			dump['children'] = list(items)


		#dump['children'] = []
		#for child in self.children:
		#	if isinstance(child, crecord):
		#		dump['children'].append(str(child._id))
		#	else:
		#		dump['children'].append(child)

		return dump

	def cat(self, dump=False):
		for_str=False

		#print "Id:\t", self._id
		#print "Owner:\t", self.owner
		#print "Group:\t", self.group
		#print "Type:\t", self.type
		#print "Writed:\t", self.write_time
		#print "Access:"
		#print "  Owner:\t", self.access_owner
		#print "  Group:\t", self.access_group
		#print "  Other:\t", self.access_other
		#print "  Anonymous:\t", self.access_unauth
		#print "Data:\n", self.data, "\n"
	
		if dump:
			data = self.dump()
		else:
			data = self.data.copy()

		output = ""
		for key in data.keys():
			try:
				output += key + ": " + str(data[key]) + "\n"
			except:
				output += key + ": " + data[key] + "\n"

		if for_str:
			return output
		else:
			print output
			

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

	
	def add_children(self, record, autosave=True):
		_id = record._id

		if autosave:
			if not _id:
				record.save()
			if not self._id:
				self.save()

		if not _id or not self._id:
			raise ValueError("You must save all records before this operation ...")

		if str(_id) not in self.children:
			self.children.append(str(_id))
			record.parent.append(str(self._id))
			if autosave:
				self.save()
				record.save()
			

	def remove_children(self, record, autosave=True):
		_id = record._id

		if autosave:
			if not _id:
				record.save()
			if not self._id:
				self.save()

		if not _id or not self._id:
			raise ValueError("You must save all records before this operation ...")

		if str(_id) in self.children:
			self.children.remove(str(_id))
			record.parent.remove(str(self._id))
			if autosave:
				self.save()
				record.save()
		

	def is_parent(self, record):
		if str(record._id) in self.children:
			return True
		else:
			return False

def access_to_str(access):
	output = ''

	if 'r' in access:
		output += 'r'
	else:
		output += '-'

	if 'w' in access:
		output += 'w'
	else:
		output += '-'

	return output


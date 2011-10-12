#!/usr/bin/env python

import logging

from crecord import crecord
from caccount import caccount
from cstorage import get_storage

class crecord_ng(crecord):
	def __init__(self, data={}, _id=None, name="noname", owner=None, group=None, raw_record=None, record=None, storage=None, account=None, type='raw', logging_level=logging.DEBUG, *args, **kargs):

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

		# name, _id, storage, record, account

		## Set Account
		if not account:
			account = caccount(user='root', group='root')

		## Set Storage
		if not storage:
			storage = get_storage(namespace='object', account=account)
			#raise Exception('You must specify storage !')

		## Set Id
		if name:
			_id = type + "." + account.user + "." + name
		if record:
			_id = record._id
		if data:
			try:
				_id = data['_id']
				del data['_id']
			except:
				pass

		## Init logger
		self.logger = logging.getLogger(_id)
		self.logger.setLevel(logging_level)
		self.logger.debug("Init %s '%s' ..." % (type, _id))


		if data:
			crecord.__init__(self, data)
		elif raw_record:
			crecord.__init__(self, raw_record=raw_record)
		else:
			## Check if object exist in mongo
			if not record and _id:
				self.logger.debug(" + Try to get record from DB ...")
				try:
					record = storage.get(_id, account=account)
					self.logger.debug("   + Success")
				except:
					self.logger.debug("   + Failed")

			## If record
			if record:
				self.logger.debug(" + Load object from record")
				_id = record._id
				crecord.__init__(self, storage=storage, record=record)
			else:
				self.logger.debug(" + Init new object")
				crecord.__init__(self, storage=storage)

		self.type = type
		self._id = _id
		self.account = account
		self.storage = storage

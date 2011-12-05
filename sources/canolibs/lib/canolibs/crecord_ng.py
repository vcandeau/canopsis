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

import logging

from crecord import crecord
from caccount import caccount
from cstorage import get_storage

class crecord_ng(crecord):
	def __init__(self, data={}, _id=None, name="noname", owner=None, group=None, raw_record=None, record=None, storage=None, account=None, type='raw', logging_level=logging.ERROR, *args, **kargs):

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
			crecord.__init__(self, data, name=name)
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
				crecord.__init__(self, storage=storage, name=name)

		self.type = type
		self._id = _id
		self.account = account
		self.storage = storage

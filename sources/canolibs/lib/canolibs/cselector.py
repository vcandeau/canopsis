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

from ccache import get_cache
from ctimer import ctimer
from ctools import calcul_pct
from pymongo import objectid

from caccount import caccount
#from cstorage import get_storage

import time
import json
import logging

class cselector(crecord):
	def __init__(self, storage, _id=None, name=None, namespace='events', use_cache=True, logging_level=None):
		self.type = 'selector'
		self.storage = storage
		
		if name and not _id:
			self._id = self.type + "." + storage.account._id + "." + name
			
		## Default vars
		self.namespace = namespace
		self.mfilter = {}
		self.changed = False
		self.mids = []
		self.timer = ctimer(logging_level=logging.INFO)
		self.use_cache = use_cache
		self.cache_time = 60
		self.cache = None
		self.last_resolv_time = 0
		self.last_nb_records = 0

		self._ids = []
		
		self.logger = logging.getLogger('cselector')
		if logging_level:
			self.logger.setLevel(logging_level)
		
		## Init
		try:
			record = storage.get(self._id)
		except:
			record = None
		
		if record:
			self.logger.debug("Init from record.")
			crecord.__init__(self, record=record, storage=storage)
		else:
			self.logger.debug("Init new record.")
			crecord.__init__(self, _id=self._id, owner=storage.account.user, group=storage.account.group, type=self.type, storage=storage)
		
	def dump(self):
		self.data['mids'] = self.mids
		self.data['namespace'] = self.namespace
		self.data['mfilter'] = json.dumps(self.mfilter)
		return crecord.dump(self)

	def load(self, dump):
		crecord.load(self, dump)
		try:
			self.mfilter = json.loads(self.data['mfilter'])
		except:
			self.mfilter = {}
		self.namespace = str(self.data['namespace'])
		self.mids = self.data['mids']
		
	def setMfilter(self, filter):
		try:
			json.dumps(self.mfilter)
			self.mfilter = filter
			self.changed = True
		except:
			raise Exception('Invalid mfilter')

	
	def resolv(self):
		def do_resolv(self):
			ids = []
			if self.mids:
				ids = self.mids
				
			if self.mfilter:
				records = self.storage.find(mfilter=self.mfilter, namespace=self.namespace)
				for record in records:
					ids.append(record._id)
		
			self.last_resolv_time = time.time()
			self.last_nb_records = len(self._ids)
			self.changed = False
			
			return ids
			
		if self.use_cache and not self.cache:
			self.logger.debug("Create cache object")
			self.cache = get_cache(storage=self.storage)
			self.cache.remove(self._id)
		
		if self.changed:
			self.logger.debug("Selector has change, get new ids")
			self._ids = do_resolv(self)
			if self.cache:
				self.cache.put(self._id, self._ids)
		
		elif self.cache:
			@self.cache.deco(self._id, self.cache_time)
			def do_resolv_cache(self):
				return do_resolv(self)
				
			self.logger.debug("Get ids from cache")
			self._ids = do_resolv_cache(self)
			
		else:
			self._ids = do_resolv(self)
		
		return self._ids
	
	def match(self, _id):
		ids = self.resolv()
		return _id in ids

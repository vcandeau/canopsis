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
from ctools import calcul_pct

from caccount import caccount
#from cstorage import get_storage

import time
import json
import logging

class cselector(crecord):
	def __init__(self, storage, _id=None, name=None, namespace='events', use_cache=True, record=None, cache_time=60, logging_level=None):
		self.type = 'selector'
		self.storage = storage
		
		if name and not _id:
			self._id = self.type + "." + storage.account._id + "." + name
			
		## Default vars
		self.namespace = namespace
		
		self.mfilter = {}
		self.include_ids = []
		self.exclude_ids = []
		self.changed = False
		
		self.use_cache = use_cache
		self.cache_time = cache_time
		self.cache = None
		
		self.last_resolv = None
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

		if not record:
			try:
				record = storage.get(self._id)
			except:
				record = None

		
		if record:
			self.logger.debug("Init from record.")
			crecord.__init__(self, record=record, storage=storage)
		else:
			self.logger.debug("Init new record.")
			crecord.__init__(self, _id=self._id, account=storage.account, type=self.type, storage=storage)
		
	def dump(self):
		self.data['include_ids'] = self.include_ids
		self.data['exclude_ids'] = self.exclude_ids
		self.data['mfilter'] = json.dumps(self.mfilter)
		self.data['namespace'] = self.namespace

		return crecord.dump(self)

	def load(self, dump):
		crecord.load(self, dump)
		try:
			self.mfilter = json.loads(self.data['mfilter'])
		except:
			self.mfilter = {}
		self.namespace = str(self.data['namespace'])
		self.include_ids = self.data['include_ids']
		self.exclude_ids = self.data['exclude_ids']
		
	def setMfilter(self, filter):
		try:
			json.dumps(self.mfilter)
			self.mfilter = filter
			self.changed = True
		except:
			raise Exception('Invalid mfilter')
			
	def setExclude_ids(self, ids):
		self.exclude_ids = ids
		self.changed = True

	def setInclude_ids(self, ids):
		self.include_ids = ids
		self.changed = True
	
	def resolv(self):
		def do_resolv(self):
			ids = []
			if self.include_ids:
				ids = self.include_ids
				
			if self.mfilter:
				records = self.storage.find(mfilter=self.mfilter, namespace=self.namespace)
				for record in records:
					if not record._id in ids:
						ids.append(record._id)
		
			if self.exclude_ids:
				ids = [_id for _id in ids if not _id in self.exclude_ids]
		
			self.last_resolv = time.time()
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
				self.logger.debug(" + Put to cache")
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
		
	def getRecords(self):
		ids = self.resolv()
		return self.storage.get(ids)
	
	def getState(self):
		# 1. Ponderation
		# 2. Nb par state
		# 3. Decision
		records = self.getRecords()
		
		## Count states
		states = {0: 0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0}
		for record in records:
			states[record.data['state']] += 1
		
		state = self.stateRule_morebadstate(states)
		
		return state
		
	def stateRule_morebadstate(self, states):
		state = 0
		## Set state
		if states[0]:
			state = 0
		if states[1]:
			state = 1
		if states[2]:
			state = 2
		return state

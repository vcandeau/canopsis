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

import os, sys, json, logging, time
import hashlib
from datetime import datetime

from pyperfstore2.store import store
import pyperfstore2.utils as utils

class manager(object):
	def __init__(self, mongo_collection='perfdata2', logging_level=logging.INFO):
		self.logger = logging.getLogger('manager')
		self.logger.setLevel(logging_level)
		
		self.store = store(mongo_collection='perfdata2', logging_level=logging.INFO)
		
		self.midnight = None
		self.get_midnight_timestamp()
		
		self.cache_max = 5000
		self.cached = 0
		self.cache_ids = {}
		
		self.fields_map = {
				'rentention':	('r', 0),
				'type':			('t', 'GAUGE'),
				'unit':			('u', None),
				'min':			('mi', None),
				'max':			('ma', None),
				'thd_warn':		('tw', None),
				'thd_crit':		('tc', None)
		}

	def get_midnight_timestamp(self):
		if not self.midnight or time.time() > self.midnight + 86400:
			self.midnight = int(time.mktime(datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).timetuple()))
			
		return self.midnight
		
	def get_node_id(self, name):
		return hashlib.md5(name).hexdigest()
		
	def get_dca_id(self, node_id):
		# get midnight timestamp
		dca_hash = "%s%s"  % (node_id, self.get_midnight_timestamp())
		return hashlib.md5(dca_hash).hexdigest()
		
	def id_exist(self, _id):
		exist = False
		if self.cache_max and self.cached <= self.cache_max:
			try:
				exist = self.cache_ids[_id]
			except:
				self.logger.debug("Store '%s' in cache" % _id)
				exist = self.store.count(_id)
				self.cache_ids[_id] = True
				self.cached += 1
		else:
			return self.store.count(_id)
				
		return exist

	def get_meta(self, _id=None, name=None):
		if not _id and not name:
			raise Exception('Invalid args')
			
		if not _id:
			_id = self.get_node_id(name)
		
		meta_data = self.store.get(_id)
		
		# Uncompress fields name
		for field in self.fields_map:
			value = meta_data.get(self.fields_map[field][0], self.fields_map[field][1])
			meta_data[field] = value
			try:
				del meta_data[self.fields_map[field][0]]
			except:
				pass
		
		return meta_data

	def push(self, name, value, timestamp=None, meta_data={}):
		
		node_id = self.get_node_id(name)
		dca_id  = self.get_dca_id(node_id)
		
		if not timestamp:
			timestamp = int(time.time())
			
		point = (timestamp, value)
		
		if self.id_exist(dca_id):
			# Append value
			self.logger.debug("Append point to dca record '%s'" % dca_id)
			self.store.push(_id=dca_id, point=point)
		else:
			# Check Meta
			if not self.id_exist(node_id):
				def set_meta(meta, field, new_field, default):
					data = meta.get(field, default)
					if data != None:
						meta[new_field] = data
					try:
						del meta[field]
					except:
						pass
					return meta
				
				# Compress fields name
				for field in self.fields_map:
					meta_data = set_meta(meta_data, field, self.fields_map[field][0], self.fields_map[field][1])
				
				self.logger.debug("Create meta record '%s'" % node_id)
				self.store.create(_id=node_id, data=meta_data)
				
			# Create DCA
			self.logger.debug("Create dca record '%s'" % dca_id)
			self.store.create(_id=dca_id, data = {'c': False, 'nid': node_id, 'fts': timestamp, 'lts': timestamp, 'd': [ point ]})
			
	def rotate(self, _id=None, name=None, force=False):
		if not _id and not name:
			raise Exception('Invalid args')
			
		if not _id:
			_id = self.get_node_id(name)
		
		self.logger.debug("Rotate '%s'" % _id)
		dcas = self.store.get_dca(_id=_id, mfilter={'c': False})
		dca_ids = []
		for dca in dcas:
			dca_id = dca['_id']
			self.logger.debug(" + %s" % dca_id)
			# Compress data
			data = utils.compress(dca['d'])
			
			# Remove plain record
			self.store.remove(_id=dca_id)
			
			# Create bin record
			self.store.create_bin(_id=dca_id, data=data)
			
			dca_ids.append((dca['fts'], dca['lts'], dca_id))
			
		# Update meta record
		self.store.update(_id=_id, mpush_all={'c': dca_ids})

	def remove(self, _id=None, name=None):
		if not _id and not name:
			raise Exception('Invalid args')
			
		if not _id:
			_id = self.get_node_id(name)
		
		self.store.remove(mfilter={'$or': [{'_id': _id}, {'nid': _id}]})

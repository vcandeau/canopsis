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
	def __init__(self, mongo_collection='perfdata2', auto_rotate=False, logging_level=logging.INFO):
		self.logger = logging.getLogger('manager')
		self.logger.setLevel(logging_level)
		
		self.store = store(mongo_collection=mongo_collection, logging_level=logging.INFO)
		self.auto_rotate = auto_rotate
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
			if self.auto_rotate and self.midnight:
				self.rotateAll()
			self.midnight = int(time.mktime(datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0).timetuple()))
			
		return self.midnight
		
	def get_meta_id(self, name):
		return hashlib.md5(name).hexdigest()
		
	def get_dca_id(self, _id):
		# get midnight timestamp
		dca_hash = "%s%s"  % (_id, self.get_midnight_timestamp())
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

	def get_id(self, _id=None, name=None):
		if not _id and not name:
			raise Exception('Invalid args')
			
		if not _id:
			_id = self.get_meta_id(name)
			
		return _id					

	def get_meta(self, _id=None, name=None, raw=False):
		_id = self.get_id(_id, name)
		
		meta_data = self.store.get(_id)
		
		if not meta_data:
			return None
		
		# Uncompress fields name
		if not raw:
			for field in self.fields_map:
				value = meta_data.get(self.fields_map[field][0], self.fields_map[field][1])
				meta_data[field] = value
				try:
					del meta_data[self.fields_map[field][0]]
				except:
					pass
		
		return meta_data

	def find_dca(self, _id=None, name=None, mfilter=None):
		_id = self.get_id(_id, name)
		
		if mfilter:
			return self.store.find(mfilter={"$and":[{'mid': _id}, mfilter]})
		else:
			return self.store.find(mfilter={'mid': _id})
	
	def find_meta(self, limit=20, skip=0, mfilter={}):
		ofilter = {'r': { '$exists' : True }}
		if mfilter:
			mfilter = {'$and': [ofilter, mfilter]}
		else:
			mfilter = ofilter
			
		return self.store.find(mfilter=mfilter, limit=limit, skip=skip)

	def push(self, value, _id=None, name=None, timestamp=None, meta_data={}):
		_id = self.get_id(_id, name)
					
		dca_id  = self.get_dca_id(_id)
		
		if not timestamp:
			timestamp = int(time.time())
			
		point = (timestamp, value)
		
		if self.id_exist(dca_id):
			# Append value
			#self.logger.debug("Append point to dca record '%s'" % dca_id)
			self.store.push(_id=dca_id, point=point)
		else:
			# Create Meta
			self.create_meta(_id=_id, meta_data=meta_data)
				
			# Create DCA
			self.logger.debug("Create dca record '%s'" % dca_id)
			self.store.create(_id=dca_id, data = {'c': False, 'mid': _id, 'fts': timestamp, 'lts': timestamp, 'd': [ point ]})

	def create_meta(self,_id=None, name=None, meta_data={}):
		_id = self.get_id(_id, name)
		
		# Check Meta
		if not self.id_exist(_id):
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
			
			self.logger.debug("Create meta record '%s'" % _id)
			self.store.create(_id=_id, data=meta_data)		
		
	def get_points(self, _id=None, name=None, tstart=None, tstop=None, raw=False, return_meta=False):
		_id = self.get_id(_id, name)
		
		points = []
		
		meta_data = self.get_meta(_id=_id)
		
		if not meta_data:
			raise Exception('Invalid _id, not found')
		
		## Compressed DCA
		if tstart < self.get_midnight_timestamp():	
			dca_ids = []
			
			for dca in meta_data.get('c', []):
				fts = dca[0]
				lts = dca[1]
				dca_id = dca[2]
				
				if tstart <= fts and tstop >= lts:
					dca_ids.append(dca_id)
				elif tstart >= fts and tstart <= lts:
					dca_ids.append(dca_id)
				elif tstop >= fts and tstop <= lts:
					dca_ids.append(dca_id)
			
			for dca_id in dca_ids:
				data = self.store.get_bin(_id=dca_id)
				points += utils.uncompress(data)
		
		## Plain DCA
		if tstop >= self.get_midnight_timestamp():
			for dca in self.find_dca(_id=_id, mfilter={'c': False}):
				points += dca['d']
		
		## Sort and Split Points
		points = sorted(points, key=lambda point: point[0])
		points = [ point for point in points if point[0] >= tstart and point[0] <= tstop ]		
		
		if raw:
			if not return_meta:
				return points
			else:
				return (meta_data, points)
			
		#parse_dst
		
		if not return_meta:
			return points
		else:
			return (meta_data, points)

	def aggregate(self, points, mode=None, atype='MEAN', time_interval=None, max_points=None):
		return utils.aggregate(points, max_points=max_points, time_interval=time_interval, atype=atype, mode=mode)

	def rotateAll(self):
		metas = self.find_meta(limit=0)
		for meta in metas:
			self.rotate(_id=metas['_id'])
		
	def rotate(self, _id=None, name=None):
		_id = self.get_id(_id, name)
		
		self.logger.debug("Rotate '%s'" % _id)
		self.logger.debug(" + Compress")
		dca_ids = []
		for dca in self.find_dca(_id=_id, mfilter={'c': False}):
			dca_id = dca['_id']
			self.logger.debug("   + DCA: %s" % dca_id)
			# Compress data
			data = utils.compress(dca['d'])
			
			# Remove plain record
			self.store.remove(_id=dca_id)
			
			# Create bin record
			self.store.create_bin(_id=dca_id, data=data)
			
			dca_ids.append((dca['fts'], dca['lts'], dca_id))
			
		# Update meta record
		self.store.update(_id=_id, mpush_all={'c': dca_ids})

		# Todo: clean old dca (retention)
		#self.logger.debug(" + Clean")

	def remove(self, _id=None, name=None):
		_id = self.get_id(_id, name)
		
		meta_data = self.get_meta(_id=_id, raw=True)
		if meta_data:
			# Remove compressed DCA
			for dca_meta in meta_data['c']:
				self.store.grid.delete(dca_meta[2])
		
		# Remove plain DCA and Meta
		self.store.remove(mfilter={'$or': [{'_id': _id}, {'mid': _id}]})

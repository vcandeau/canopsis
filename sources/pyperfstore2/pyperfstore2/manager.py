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

from pyperfstore2.store import store
import pyperfstore2.utils as utils

class manager(object):
	def __init__(self, mongo_collection='perfdata2', auto_rotate=False, auto_clean=False, retention=0, dca_min_length = 300, logging_level=logging.INFO):
		self.logger = logging.getLogger('manager')
		self.logger.setLevel(logging_level)
		
		self.store = store(mongo_collection=mongo_collection, logging_level=logging.INFO)
		self.auto_rotate = auto_rotate
		self.auto_clean = auto_clean
		
		self.dca_min_length = dca_min_length
		
		self.timestamp = 0
		self.timeperiod = 86400
		
		self.need_rotate = False
		
		self.get_timestamp()
		
		self.retention = retention * 3600
		
		self.cache_max = 5000
		self.cached = 0
		self.cache_ids = {}
		
		self.fields_map = {
				'retention':	('r', self.retention),
				'type':			('t', 'GAUGE'),
				'unit':			('u', None),
				'min':			('mi', None),
				'max':			('ma', None),
				'thd_warn':		('tw', None),
				'thd_crit':		('tc', None)
		}
		
	def gen_timestamp(self):
		now = int(time.time()) 
		return now - (now % self.timeperiod)

	def get_timestamp(self):
		now = int(time.time())
		
		## Init
		if not self.timestamp:
			self.timestamp = self.gen_timestamp()
		
		if now > (self.timestamp + self.timeperiod):
			if self.timestamp:
				self.need_rotate = True
				
			# Empty cache
			self.cached = 0
			self.cache_ids = {}
			self.timestamp = self.gen_timestamp()
			self.logger.info("Generate new timestamp: %s" % self.timestamp)

		## Auto rotate
		if self.need_rotate and self.auto_rotate:
			self.auto_rotate = False
			self.logger.debug("Start auto-rotate")
			self.rotateAll()
			self.logger.debug("End of auto-rotate")
			self.auto_rotate = True
			self.need_rotate = False

		return self.timestamp
		
	def get_meta_id(self, name):
		return hashlib.md5(name).hexdigest()
		
	def get_dca_id(self, _id):
		# get midnight timestamp
		dca_hash = "%s%s"  % (_id, self.get_timestamp())
		return hashlib.md5(dca_hash).hexdigest()
		
	def id_exist(self, _id):
		exist = False
		if self.cache_max and self.cached <= self.cache_max:
			try:
				exist = self.cache_ids[_id]
			except:
				exist = self.store.count(_id)
				if exist:
					#self.logger.debug("Store '%s' in cache" % _id)
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
			meta_data = self.uncompress_meta_fields(meta_data)
		
		return meta_data
		
	def uncompress_meta_fields(self, meta_data):
		for field in self.fields_map:
			value = meta_data.get(self.fields_map[field][0], self.fields_map[field][1])
			meta_data[field] = value
			try:
				del meta_data[self.fields_map[field][0]]
			except:
				pass
				
		return meta_data
	
	def compress_meta_fields(self, meta_data):
		# Compress fields name
		def set_meta(meta, field, new_field, default):
			data = meta.get(field, default)
			if data != None:
				meta[new_field] = data
			try:
				del meta[field]
			except:
				pass
			return meta		

		for field in self.fields_map:
			meta_data = set_meta(meta_data, field, self.fields_map[field][0], self.fields_map[field][1])
			
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
			if not self.id_exist(_id):
				self.create_meta(_id=_id, meta_data=meta_data)
				
			# Create DCA
			self.logger.debug("Create dca record '%s'" % dca_id)
			self.store.create(_id=dca_id, data = {'c': False, 'mid': _id, 'fts': timestamp, 'lts': timestamp, 'd': [ point ]})

	def create_meta(self,_id=None, name=None, meta_data={}):
		_id = self.get_id(_id, name)
		
		# Check Meta
		if not self.id_exist(_id):
			meta_data = self.compress_meta_fields(meta_data)
			
			# Next Clean
			if meta_data['r']:
				meta_data['nc'] = int(time.time()) + meta_data['r']
			
			self.logger.debug("Create meta record '%s'" % _id)
			self.store.create(_id=_id, data=meta_data)
		
	def get_points(self, _id=None, name=None, tstart=None, tstop=None, raw=False, return_meta=False):
		_id = self.get_id(_id, name)
		
		points = []
		
		meta_data = self.get_meta(_id=_id)
		
		if not meta_data:
			raise Exception('Invalid _id, not found %s' % name)
		
		## Compressed DCA
		if tstart < self.get_timestamp():	
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
		if tstop >= self.get_timestamp():
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
		dtype = meta_data.get('type', None)
		if dtype:
			points = utils.parse_dst(points,dtype)
		
		if not return_meta:
			return points
		else:
			return (meta_data, points)

	def rotateAll(self, force=False):
		self.need_rotate = False
		self.rotate(force=force)
		
	def rotate(self, _id=None, name=None, force=False):
		try:
			_id = self.get_id(_id, name)
		except:
			_id = None
			
		now_timeperiod = self.get_timestamp()
		
		##### Disable force feature !
		force = False
		if force:
			self.logger.info("Force DCA Rotation")
			now_timeperiod += self.timeperiod
		
		# Find yesterday DCA
		if _id:
			self.logger.debug("Rotate DCA '%s'" % _id)
			dcas = self.find_dca(_id=_id, mfilter={'c': False, 'fts': {'$lt': now_timeperiod }})
		else:
			self.logger.info("Rotate All DCA")
			dcas = self.store.find(mfilter={'c': False, 'fts': {'$lt': now_timeperiod }})
		
		if not dcas.count():
			self.logger.debug(" + Nothing to do")
			return
		
		for dca in dcas:
			dca_id = dca['_id']
			self.logger.debug(" + DCA: %s" % dca_id)
			
			#check if must compress or not
			if len(dca['d']) >= self.dca_min_length or force:
				self.logger.debug("  + Compress")
				
				data = utils.compress(dca['d'])
							
				try:
					self.logger.debug("   + Store in binary record")
					self.store.create_bin(_id=dca_id, data=data)	
					
					# Remove plain record
					if not force:
						self.store.remove(_id=dca_id)
					else:
						## for // process (push), in force mode dont remove dca
						self.store.update(_id=dca_id, mset={'c': False, 'fts': None, 'lts': None, 'd': []})
				
					# remove cache too
					if dca_id in self.cache_ids:
						del self.cache_ids[dca_id]
						self.cached -= 1
						
					# Put ID in compressed list
					self.logger.debug("     + Add binary Id in meta (%s)" % dca['mid'])
					self.store.update(_id=dca['mid'], mpush={'c': (dca['fts'], dca['lts'], dca_id)})
					
				except Exception,err:
					self.logger.info('Impossible to rotate %s: %s' % (dca_id, err))
					
			else:
				self.logger.debug("  + Not enough point in DCA")
				
				## Put point in begin of today DCA
				today_dca_id = self.get_dca_id(dca['mid'])
				today_dca = self.store.get(today_dca_id)
				
				if today_dca:
					if dca['fts'] == today_dca['fts']:
						self.logger.debug("    + Already merged, nothing to do")
					else:		
						self.logger.debug("    + Update current DCA with old values")
				
						data = dca['d'] + today_dca['d']
						
						# Add data to today
						self.store.update(_id=today_dca_id, mset={'d': data, 'fts': dca['fts'] })
						
						# Remove plain record
						self.store.remove(_id=dca_id)
	
				else:
					self.logger.debug("    + Move DCA")
					# Create new record
					self.store.create(_id=today_dca_id, data=dca)
					
					# Remove old record
					self.store.remove(_id=dca_id)
			
			if self.auto_clean:
				self.clean()
	
	def cleanAll(self, timestamp=None):
		self.clean(timestamp=timestamp)
		
	def clean(self, _id=None, name=None, timestamp=None):
		try:
			_id = self.get_id(_id, name)
		except:
			_id = None
		
		if not timestamp:
			timestamp = int(time.time())
		
		self.logger.debug("Remove DCA when 'nc' is older than %s:" % timestamp)
		
		if _id:
			metas = self.find_meta(limit=1, mfilter={'_id': _id, 'nc': {'$lte': timestamp}})
		else:
			self.logger.debug(" + Clean all old Metas")
			metas = self.find_meta(limit=0, mfilter={'nc': {'$lte': timestamp}})
		
		nb_metas = metas.count()

		if not nb_metas:
			self.logger.debug("   + Nothing to clean")
			return
		else:
			self.logger.debug("   + Start cleanning of %s metas" % nb_metas)
					
		for meta in metas:
			self.logger.debug("   + Clean meta '%s'" % meta['_id'])
			for dca_meta in meta['c']:
				# check lts
				if  dca_meta[1] < timestamp:
					self.logger.debug("     + Remove binarie DCA '%s'" %  dca_meta[2])
					self.store.grid.delete(dca_meta[2])
					
					# Remove dca meta
					self.store.update(_id=meta['_id'], mpop={ 'c' : -1  })
				else:
					#self.logger.debug("     + No points to clean")
					break
				

	def remove(self, _id=None, name=None):
		_id = self.get_id(_id, name)
		
		meta_data = self.get_meta(_id=_id, raw=True)
		if meta_data:
			# Remove compressed DCA (if there is compressed dca)
			if 'c' in meta_data:
				for dca_meta in meta_data['c']:
					self.store.grid.delete(dca_meta[2])
		
		# Remove plain DCA and Meta
		self.store.remove(mfilter={'$or': [{'_id': _id}, {'mid': _id}]})
		
		#remove from cache
		if _id in self.cache_ids:
			del self.cache_ids[_id]
	
	def showStats(self):
		metas = self.find_meta(limit=0)
		dcas = self.store.find(mfilter={'c': False, 'mid': { '$exists' : True }})
		mcount = metas.count()
		size = self.store.size()
		
		self.logger.info("Metas:       %s" % mcount)
		self.logger.info("Plain DCAs:  %s" % dcas.count())
		if mcount:
			self.logger.info("Size/metric: %.3f KB" % ((float(size)/mcount)/1024.0))
		self.logger.info("Total size:  %.3f MB" % (size/1024.0/1024.0))
	
	
	def showAll(self):
		metas = self.find_meta(limit=0)
		for meta in metas:
			self.show(meta=self.uncompress_meta_fields(meta))
			
	def show(self, _id=None, name=None, meta=None):
		if not meta:
			_id = self.get_id(_id, name)
			meta = self.get_meta(_id=_id)
		else:
			_id = meta['_id']
		
		if meta and _id:
			self.logger.info("Metadata:'%s'" % meta['_id'])
			for key in meta:
				if key != '_id' and key != 'c':
					self.logger.info(" + %s: %s" % (key, meta[key]))
			
			self.logger.info(" + Plain DCA: %s" % self.find_dca(_id).count())
			self.logger.info(" + Compressed DCA: %s" % len(meta.get('c', [])))
			self.logger.info(" + Next Clean: %s" % meta.get('nc', None) )
			
			

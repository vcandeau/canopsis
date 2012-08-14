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

from bson.errors import InvalidStringData
from pymongo import Connection
from gridfs import GridFS

class store(object):
	def __init__(self, mongo_host="127.0.0.1", mongo_port=27017, mongo_db='canopsis', mongo_collection='perfdata2', mongo_safe=False, logging_level=logging.INFO):
		self.logger = logging.getLogger('store')
		self.logger.setLevel(logging_level)
		
		self.logger.debug(" + Init MongoDB Store")

		self.mongo_host = mongo_host
		self.mongo_port = mongo_port
		self.mongo_db = mongo_db
		self.mongo_collection = mongo_collection
		self.mongo_safe = mongo_safe
		
		self.connected = False
		
		self.connect()

	def connect(self):
		if self.connected:
			self.logger.warning("Impossible to connect, already connected")
			return True
		else:
			self.logger.debug("Connect to MongoDB (%s/%s@%s:%s)" % (self.mongo_db, self.mongo_collection, self.mongo_host, self.mongo_port))
			
			try:
				self.conn=Connection(self.mongo_host, self.mongo_port)
			except Exception, err:
				self.logger.error(" + %s" % err)
				return False
				
			self.db=self.conn[self.mongo_db]
			self.collection = self.db[self.mongo_collection]
			self.grid = GridFS(self.db, self.mongo_collection+"_bin")
			self.connected = True
			self.logger.debug(" + Success")
			return True
			
	def check_connection(self):
		if not self.connected:
			if not self.connect():
				raise Exception('Impossible to push, not connected ...')
						
	def count(self, _id):
		return self.collection.find({'_id': _id}).count()
		
	def update(self, _id, mset=None, munset=None, mpush=None, mpush_all=None):
		self.check_connection()
		data = {}
		if mset:
			data['$set'] = mset
		if munset:
			data['$unset'] = munset
		if mpush:
			data['$push'] = mpush
		if mpush_all:
			data['$pushAll'] = mpush_all
		
		if data:
			return self.collection.update({'_id': _id}, data, upsert=False, safe=self.mongo_safe)
	
	def push(self, _id, point):
		self.check_connection()

		lts = point[0]
	
		self.logger.debug("Push point '%s' in '%s'" % (point, _id))
		return self.update(_id=_id, mset={'lts': lts}, mpush={'d': point})

	def create(self, _id, data):
		self.check_connection()
		data['_id'] = _id
		self.logger.debug("Create record '%s'" % _id)
		return self.collection.insert(data, safe=self.mongo_safe)

	def create_bin(self, _id, data):
		self.check_connection()
		self.logger.debug("Create bin record '%s'" % _id)
		return self.grid.put(data, _id=_id)
			
	def remove(self, _id=None, mfilter=None):
		if mfilter:
			return self.collection.remove(mfilter)
		elif _id:
			return self.collection.remove({'_id': _id})
		
	def size(self):
		self.logger.info("Size of dbs:")
		size = 0
		try:
			size = self.db.command("collstats", self.mongo_collection)['size']
		except:
			self.logger.warning("Impossible to read Collecion Size")
		
		self.logger.info(" + Collection:  %0.2f MB" % (size/1024.0/1024.0))
		try:			
			bin_size = self.db.command("collstats", self.mongo_collection+"_bin.files")['size']
			self.logger.info(" + Meta:        %0.2f MB" % (bin_size /1024.0/1024.0))
			
			chunks_size = self.db.command("collstats", self.mongo_collection+"_bin.chunks")['size']
			self.logger.info(" + Binaries:    %0.2f MB" % (chunks_size /1024.0/1024.0))
			
			size += chunks_size + bin_size
		except:
			self.logger.warning("Impossible to read GridFS Size")
			pass

		
		return size
	
	def get(self, _id):
		return self.collection.find_one({'_id': _id})
	
	def get_bin(self, _id):
		return self.grid.get(_id).read()

	def find(self, limit=0, skip=0, mfilter={}):			
		return self.collection.find(mfilter, limit=limit, skip=skip)
							
	def drop(self):
		self.db.drop_collection(self.mongo_collection)
		self.db.drop_collection(self.mongo_collection+"_bin.chunks")
		self.db.drop_collection(self.mongo_collection+"_bin.files")
		
	def disconnect(self):
		if self.connected:
			self.logger.debug("Disconnect from MongoDB")
			self.conn.disconnect()
		else:
			self.logger.warning("Impossible to disconnect, you are not connected")

	def __del__(self):
		self.disconnect()

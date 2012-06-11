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

from pymongo import Connection
from pymongo import objectid

from pymongo import ASCENDING
from pymongo import DESCENDING

import gridfs

from caccount import caccount
from crecord import crecord
from cfile import cfile

import logging
import time
import sys, os
import ConfigParser

CONFIG = ConfigParser.RawConfigParser()
CONFIG.read(os.path.expanduser('~/etc/cstorage.conf'))

class cstorage(object):
	def __init__(self, account, namespace='object', logging_level=logging.ERROR, mongo_host="127.0.0.1", mongo_port=27017, mongo_db='canopsis', mongo_autoconnect=True, groups=[]):

		try:
			self.mongo_host=CONFIG.get("master", "host")
		except:
			self.mongo_host=mongo_host

		try:
			self.mongo_port=CONFIG.getint("master", "port")
		except:
			self.mongo_port=mongo_port

		try:
			self.mongo_db=CONFIG.get("master", "db")
		except:	
			self.mongo_db=mongo_db
		
		self.mongo_safe=True

		self.account = account

		self.namespace=namespace
		self.backend = None

		self.logger = logging.getLogger('cstorage')
		self.logger.setLevel(logging_level)

		self.logger.debug("Object initialised.")

		self.backend = {}
		
		if mongo_autoconnect:
			self.backend_connect()
	
	def clean_id(self, _id):
		try:
			int(_id, 16)
			return objectid.ObjectId(_id)
		except:
			return _id	

	def make_mongofilter(self, account):
		Read_mfilter = {}
		Write_mfilter = {}

		if account._id != "account.root" and account.group != "group.root":
			Read_mfilter = { '$or': [
				{'aaa_owner': account._id, 'aaa_access_owner': 'r'},
				{'aaa_group': account.group, 'aaa_access_group': 'r'},
				{'aaa_group': {'$in': account.groups}, 'aaa_access_group': 'r'},
				{'aaa_admin_group':account.group},
				{'aaa_admin_group':{'$in': account.groups}},
				{'aaa_access_unauth': 'r'}
			] }
	
			Write_mfilter = { '$or': [
				{'aaa_owner': account._id, 'aaa_access_owner': 'w'},
				{'aaa_group': account.group, 'aaa_access_group': 'w'},
				{'aaa_group': {'$in': account.groups}, 'aaa_access_group': 'w'},
				{'aaa_admin_group':account.group},
				{'aaa_admin_group':{'$in': account.groups}},
				{'aaa_access_unauth': 'w'}
			] }

			if account.user != "anonymous":
				Read_mfilter['$or'].append({'aaa_access_other': 'r'})
				Write_mfilter['$or'].append({'aaa_access_other': 'w'})

		return (Read_mfilter, Write_mfilter)


	def backend_connect(self):
		self.conn=Connection(self.mongo_host, self.mongo_port)
		self.db=self.conn[self.mongo_db]

		self.logger.debug("Connected.")

	def get_backend(self, namespace=None):
		if not namespace:
			namespace = self.namespace

		try:
			backend = self.backend[namespace]
			self.logger.debug("Use %s collection" % namespace)
			return backend
		except:
			self.backend[namespace] = self.db[namespace]
			self.logger.debug("Connected to %s collection." % namespace)
			return self.backend[namespace]
			

	def put(self, _record_or_records, account=None, namespace=None):
		if not account:
			account = self.account

		records = []
		return_ids = []


		if isinstance(_record_or_records, crecord):
			records = [_record_or_records]
		elif isinstance(_record_or_records, list):
			records = _record_or_records
			
		backend = self.get_backend(namespace)

		self.logger.debug("Put %s record(s) ..." % len(records))
		for record in records:
			_id = record._id

			if isinstance(record, cfile):
				data_id = self.put_data(record.data['bin_data'], record.data['file_name'], record.data['content_type'])
				del record.data['bin_data']
				record.data['data_id'] = data_id

			if not record.owner:
				record.owner = account._id
				#record.owner = account.user
			if not record.group:
				record.group = account.group

			if _id:
			## Update
				## Check rights
				if account.user == 'root':
					access = True
				else:
					try:
						oldrecord = self.get(_id, namespace=namespace, account=account)
						access = oldrecord.check_write(account)
					except Exception, err:
						## New record
						## Todo: check if account have right to create record ...
						self.logger.debug("Impossible to get old record (%s)" % err)
						access = True

				if access:
					try:
						record.write_time = int(time.time())
						data = record.dump()
						
						del data['_id']
						ret = backend.update({'_id': _id}, {"$set": data}, upsert=True, safe=self.mongo_safe)

						if self.mongo_safe:
							if ret['updatedExisting']:
								self.logger.debug("Successfully updated (_id: '%s')" % _id)
							else:
								self.logger.debug("Successfully saved (_id: '%s')" % _id)

					except Exception, err:
						self.logger.error("Impossible to store !\nReason: %s" % err)
						self.logger.debug("Record dump:\n%s" % record.dump())
						raise ValueError("Impossible to store (%s)" % err)
	
					record._id = _id
					return_ids.append(_id)
				else:
					self.logger.error("Puts: Access denied ...")
					raise ValueError("Access denied")
			else:
			## Insert
				try:
					record.write_time = int(time.time())
					data = record.dump()
					## Del it if 'None'
					if not data['_id']:
						del data['_id']

					_id = backend.insert(data, safe=self.mongo_safe)
					self.logger.debug("Successfully inserted (_id: '%s')" % _id)
				except Exception, err:
					self.logger.error("Impossible to store !\nReason: %s" % err)
					self.logger.debug("Record dump:\n%s" % record.dump())
					self.logger.debug("Successfully inserted, _id: '%s'" % _id)

				record._id = _id
				return_ids.append(_id)

		if len(return_ids) == 1:
			return return_ids[0]
		else:
			return return_ids
	'''
	#warning : not tested
	def recursive_put(self, record,depth=0, account=None, namespace=None):
		depth += 1
		
		children_ids = []
		
		for child in record.children:
			self.recursive_put(child,depth,account=account,namespace=namespace)
			children_ids.append(child._id)
			
		record.children = children_ids
		self.put(record,account=None, namespace=None)
	'''	
		

	def find_one(self, *args, **kargs):
		return self.find(one=True, *args, **kargs)

	def count(self, *args, **kargs):
		return self.find(count=True, *args, **kargs)

	def find(self, mfilter={}, mfields=None, account=None, namespace=None, one=False, count=False, sort=None, limit=0, offset=0):
		if not account:
			account = self.account

		if one:
			sort = [('timestamp', -1)]

		self.logger.debug("Find '%s' records ..." % mfilter)
		
		(Read_mfilter, Write_mfilter) = self.make_mongofilter(account)

		if Read_mfilter:
			mfilter = { '$and': [ mfilter, Read_mfilter ] }

		self.logger.debug(" + %s" % mfilter)

		backend = self.get_backend(namespace)

		if one:
			raw_records = backend.find_one(mfilter, safe=self.mongo_safe)
			if raw_records:
				raw_records = [ raw_records ]
			else:
				raw_records = []
		else:
			raw_records = backend.find(mfilter, safe=self.mongo_safe)
			if count:
				return raw_records.count()
			## Limit output
			if raw_records and limit:
				raw_records = raw_records.limit(limit)
			if raw_records and offset:
				raw_records = raw_records.skip(offset)
			if raw_records and sort:
				raw_records.sort(sort)

		records=[]
		for raw_record in raw_records:
			try:
				records.append(crecord(raw_record=raw_record))
			except Exception, err:
				## Not record format ..
				self.logger.error("Impossible parse record ('%s') !" % err)

		self.logger.debug("Found %s record(s)" % len(records))

		if one:
			if len(records) > 0:
				return records[0]
			else:
				return None
		else:
			return records

	def get(self, _id_or_ids, account=None, namespace=None):
		if not account:
			account = self.account

		if isinstance(_id_or_ids, list):
			_ids = _id_or_ids
		else:
			_ids = [ _id_or_ids ]

		## TODO
		_id = _ids[0]

		backend = self.get_backend(namespace)
		
		self.logger.debug(" + Get record '%s'" % _id)

		try:
			oid = self.clean_id(_id)

			(Read_mfilter, Write_mfilter) = self.make_mongofilter(account)
			oid_mfilter = {'_id': oid}
			id_mfilter = {'_id': _id}

			#mfilter = dict(oid_mfilter.items() + Read_mfilter.items())
			mfilter = { '$and': [ oid_mfilter, Read_mfilter ] }
			raw_record = backend.find_one(mfilter, safe=self.mongo_safe)

			if not raw_record:
				# small hack for wrong oid
				#mfilter = dict(id_mfilter.items() + Read_mfilter.items())
				mfilter = { '$and': [ id_mfilter, Read_mfilter ] }
				raw_record = backend.find_one(mfilter, safe=self.mongo_safe)
			
		except Exception, err:
			self.logger.error("Impossible get record '%s' !\nReason: %s" % (_id, err))

		if not raw_record:
			raise KeyError("'%s' not found ..." % _id)
			
		return crecord(raw_record=raw_record)

	def remove(self, _id_or_ids, account=None, namespace=None):
		if not account:
			account = self.account

		_ids = []

		if isinstance(_id_or_ids, crecord):
			_ids = [ _id_or_ids._id ]
		elif isinstance(_id_or_ids, list):
			if len(_id_or_ids) > 0:
				if isinstance(_id_or_ids[0], crecord):
					for record in _id_or_ids:
						_ids.append(record._id)
				else:
					_ids = _id_or_ids
		else:
			_ids = [ _id_or_ids ]

		backend = self.get_backend(namespace)
	
		self.logger.debug("Remove %s record(s) ..." % len(_ids))
		for _id in _ids:
			self.logger.debug(" + Remove record '%s'" % _id)
			
			oid = self.clean_id(_id)
			if account.user == 'root':
				access = True
			else:
				try:
					oldrecord = self.get(oid, account=account)
				except Exception, err:
					raise ValueError("Access denied or id not found")
					
				access = oldrecord.check_write(account)			
	
			if access:
				try:
					backend.remove({'_id': oid}, safe=self.mongo_safe)
				except Exception, err:
					self.logger.error("Impossible remove record '%s' !\nReason: %s" % (_id, err))
			else:				
				self.logger.error("Remove: Access denied ...")
				raise ValueError("Access denied ...")

	def map_reduce(self, mfilter, mmap, mreduce, account=None, namespace=None):
		if not account:
			account = self.account

		backend = self.get_backend(namespace)
		
		(Read_mfilter, Write_mfilter) = self.make_mongofilter(account)
		#mfilter = dict(mfilter.items() + Read_mfilter.items())
		mfilter = { '$and': [ mfilter, Read_mfilter ] }

		output = {}
		if backend.find(mfilter).count() > 0:	
			result = backend.map_reduce(mmap, mreduce, "mapreduce", query=mfilter)
			for doc in result.find():
				output[doc['_id']] = doc['value']

		return output
						

	def drop_namespace(self, namespace):
		self.db.drop_collection(namespace)

	def get_namespace_size(self, namespace=None):
		if not namespace:
			namespace = self.namespace
		
		try:
			return self.db.command("collstats", namespace)['size']
		except:
			return 0

	def recursive_get(self, record, depth=0,account=None, namespace=None):
		depth += 1
		childs = record.children
		if len(childs) == 0:
			return

		record.children = []

		for child in childs:
			# HACK: fix root_directory in UI !!!
			try:
				rec = self.get(child,account=account,namespace=namespace)
				self.recursive_get(rec, depth,account=account,namespace=namespace)
				record.children.append(rec)
			except Exception, err:
				self.logger.debug(err)
	
	
	'''		
	def recursive_dump(self, record, depth=0,account=None, namespace=None):
		depth += 1
		childs = record.children
		if len(childs) == 0:
			return
			
		jsonRecord = record.dump(json=True)
		jsonRecord['children'] = []
		
		for child in childs:
			rec = self.get(child,account=account,namespace=namespace)
			self.set_record_tree(rec, depth,account=account,namespace=namespace)
			#record.children_record.append(rec)
			jsonRecord['children'].append(rec.dump(json=True))
			
		return jsonRecord
	'''

	def get_record_childs(self, record,account=None, namespace=None):
		child_ids = record.children
		if len(child_ids) == 0:
			return []

		records = []
		for _id in child_ids:
			records.append(self.get(str(_id),account=account, namespace=namespace))

		return records
				

	def print_record_tree(self, record, depth=0):
		depth+=1

		childs = record.children_record
		if len(childs) == 0:
			return

		if depth == 1:
			print "|-> " + str(record.name)

		for child in childs:

			prefix = ""
			for i in range(depth):
				prefix += "  "
			prefix += "|"
			for i in range(depth):
				prefix += "--"
			print prefix + "> " + str(child.name)
	
			self.print_record_tree(child, depth)


	def get_childs_of_parent(self, record_or_id, rtype=None, account=None):

		if isinstance(record_or_id, crecord):
			_id = record_or_id._id
		else:
			_id = record_or_id		

		mfilter = {'parent': _id}

		if rtype:
			mfilter['crecord_type'] = rtype
		
		return self.find(mfilter, account=account)		

	def get_parents_of_child(self, record_or_id, rtype=None, account=None):

		if isinstance(record_or_id, crecord):
			_id = record_or_id._id
		else:
			_id = record_or_id

		mfilter = {'child': _id}

		if rtype:
			mfilter['crecord_type'] = rtype

		return self.find(mfilter, account=account)
	'''		
	def add_children(self, parent_record, child_record, autosave=True):
		_id = child_record._id

		if autosave:
			if not _id:
				child_record.save()
			if not parent_record._id:
				parent_record.save()

		if not _id or not parent_record._id:
			raise ValueError("You must save all records before this operation ...")

		if str(_id) not in parent_record.children:
			parent_record.children.append(str(_id))
			child_record.parent.append(str(parent_record._id))
			if autosave:
				parent_record.save()
				child_record.save()
				
	def remove_children(self, parent_record, child_record, autosave=True):
		_id = child_record._id

		if autosave:
			if not _id:
				child_record.save()
			if not parent_record._id:
				parent_record.save()

		if not _id or not parent_record._id:
			raise ValueError("You must save all records before this operation ...")

		if str(_id) in parent_record.children:
			parent_record.children.remove(str(_id))
			child_record.parent.remove(str(parent_record._id))
			if autosave:
				parent_record.save()
				child_record.save()
	'''			
	def is_parent(self, parent_record, child_record):
		if str(child_record._id) in parent_record.children:
			return True
		else:
			return False

	def put_data(self, data, file_name, content_type):
		fs = gridfs.GridFS(self.db, CONFIG.get("master", "gridfs_namespace"))
		bin_id = fs.put(data, filename=file_name, content_type=content_type)
		return bin_id

	def get_data(self, data_id):
		fs = gridfs.GridFS(self.db, CONFIG.get("master", "gridfs_namespace"))
		bin_data = fs.get(data_id).read()
		bin_data = fs.get(data_id)
		return bin_data

	def remove_data(self, data_id):
		fs = gridfs.GridFS(self.db, CONFIG.get("master", "gridfs_namespace"))
		try:
			fs.delete(data_id)
		except Exception, err:
			self.logger.error('Error when remove binarie', err)
	
	def check_data(self, data_id):
		fs = gridfs.GridFS(self.db, CONFIG.get("master", "gridfs_namespace"))
		return fs.exists(data_id)
	
	def __del__(self):
		self.logger.debug("Object deleted. (namespace: %s)" % self.namespace)

#####
#       docs = doc_or_docs
#        return_one = False
#        if isinstance(docs, dict):
#            return_one = True
#            docs = [docs]	
##################

## Cache storage
STORAGES = {}
def get_storage(namespace='object', account=None, logging_level=logging.INFO):
	global STORAGES
	try:
		return STORAGES[namespace]
	except:
		if not account:
			account = caccount()
		
		STORAGES[namespace] = cstorage(account, namespace=namespace, logging_level=logging_level)
		return STORAGES[namespace]


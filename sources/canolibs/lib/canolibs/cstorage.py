#!/usr/bin/env python

from pymongo import Connection
from pymongo import objectid

from caccount import caccount
from crecord import crecord

import logging
import time

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class cstorage(object):
	def __init__(self, account, namespace='object', logging_level=logging.INFO, mongo_host="127.0.0.1", mongo_port=27017, mongo_db='canopsis', mongo_autoconnect=True, groups=[]):

		self.mongo_host=mongo_host
		self.mongo_port=mongo_port
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

	def make_mongofilter(self, account):
		Read_mfilter = {}
		Write_mfilter = {}

		if account.user != "root":
			Read_mfilter = { '$or': [
				{'aaa_owner': account.user, 'aaa_access_owner': 'r'},
				{'aaa_group': account.group, 'aaa_access_group': 'r'},
				{'aaa_access_unauth': 'r'}
			] }
	
			Write_mfilter = { '$or': [
				{'aaa_owner': account.user, 'aaa_access_owner': 'w'},
				{'aaa_group': account.group, 'aaa_access_group': 'w'},
				{'aaa_access_unauth': 'w'}
			] }

			if account.user != "anonymous":
				Read_mfilter['$or'].append({'aaa_access_other': 'w'})

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

			if not record.owner:
				record.owner = account.user
			if not record.group:
				record.group = account.group

			if _id:
			## Update
				## Check rights
				if account.user == 'root':
					access = True
				else:
					oldrecord = self.get(_id)
					access = oldrecord.check_write(account)

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
	
					record._id = _id
					return_ids.append(_id)
				else:
					self.logger.error("Puts: Access denied ...")
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

	def find_one(self, mfilter={}, mfields=None, account=None, namespace=None):
		return self.find(one=True, mfilter=mfilter, mfields=mfields, account=account, namespace=namespace)

	def find(self, mfilter={}, mfields=None, account=None, namespace=None, one=False, sort=None, limit=0, offset=0):
		if not account:
			account = self.account

		if one:
			sort = [('timestamp', -1)]

		(Read_mfilter, Write_mfilter) = self.make_mongofilter(account)

		self.logger.debug("Find '%s' records ..." % mfilter)

		mfilter = dict(mfilter.items() + Read_mfilter.items())

		backend = self.get_backend(namespace)

		if one:
			raw_records = backend.find_one(mfilter, safe=self.mongo_safe, sort=sort)
			if raw_records:
				raw_records = [ raw_records ]
			else:
				raw_records = []
		else:
			raw_records = backend.find(mfilter, safe=self.mongo_safe, sort=sort)
			## Limit output
			if raw_records and limit:
				raw_records = raw_records.limit(limit)
			if raw_records and offset:
				raw_records = raw_records.skip(offset)

		#if raw_records and sort:
		#	raw_records.sort(sort)

		records=[]
		for raw_record in raw_records:
			try:
				records.append(crecord(raw_record=raw_record))
			except:
				## Not record format ...
				pass

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
			try:
				oid = objectid.ObjectId(_id)
			except:
				oid = _id

			(Read_mfilter, Write_mfilter) = self.make_mongofilter(account)
			oid_mfilter = {'_id': oid}
			id_mfilter = {'_id': _id}

			mfilter = dict(oid_mfilter.items() + Read_mfilter.items())
			raw_record = backend.find_one(mfilter, safe=self.mongo_safe)

			if not raw_record:
				# small hack for wrong oid
				mfilter = dict(id_mfilter.items() + Read_mfilter.items())
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
			
			try:
				oid = objectid.ObjectId(_id)
			except:
				oid = _id

			if account.user == 'root':
				access = True
			else:
				oldrecord = self.get(_id)
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
		mfilter = dict(mfilter.items() + Read_mfilter.items())

		output = {}
		if backend.find(mfilter).count() > 0:	
			result = backend.map_reduce(mmap, mreduce, "mapreduce", query=mfilter)
			for doc in result.find():
				output[doc['_id']] = doc['value']

		return output
						

	def drop_namespace(self, namespace):
		self.db.drop_collection(namespace)

	def set_record_tree(self, record, depth=0):
		depth += 1
		childs = record.children
		if len(childs) == 0:
			return

		rchilds = []
		for child in childs:
			rec = self.get(child)
			self.set_record_tree(rec, depth)
			record.children_record.append(rec)


	def get_record_childs(self, record):
		child_ids = record.children
		if len(child_ids) == 0:
			return []

		records = []
		for _id in child_ids:
			records.append(self.get(_id))

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


	def get_childs_of_parent(self, record_or_id, rtype=None):

		if isinstance(record_or_id, crecord):
			_id = record_or_id._id
		else:
			_id = record_or_id		

		mfilter = {'parent': _id}

		if rtype:
			mfilter['crecord_type'] = rtype
		
		return self.find(mfilter)		

	def get_parents_of_child(self, record_or_id, rtype=None):

		if isinstance(record_or_id, crecord):
			_id = record_or_id._id
		else:
			_id = record_or_id

		mfilter = {'child': _id}

		if rtype:
			mfilter['crecord_type'] = rtype

		return self.find(mfilter)



	def __del__(self):
		self.logger.debug("Object deleted.")



#####
#       docs = doc_or_docs
#        return_one = False
#        if isinstance(docs, dict):
#            return_one = True
#            docs = [docs]	
##################


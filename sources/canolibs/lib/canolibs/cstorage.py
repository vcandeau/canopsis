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
	def __init__(self, default_account, namespace='object', logging_level=logging.DEBUG, mongo_host="127.0.0.1", mongo_port=27017, mongo_db='canopsis', mongo_autoconnect=True, groups=[]):

		self.mongo_host=mongo_host
		self.mongo_port=mongo_port
		self.mongo_db=mongo_db
		self.mongo_safe=True

		self.default_account = default_account

		self.namespace=namespace
		self.backend = None

		self.logger = logging.getLogger('cstorage-'+namespace)
		self.logger.setLevel(logging_level)

		self.logger.debug("Object initialised.")
		
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
		self.backend=self.db[self.namespace]

		self.logger.debug("Connected.")

	def put(self, _record_or_records, account=None):
		if not account:
			account = self.default_account

		records = []
		return_ids = []

		if isinstance(_record_or_records, crecord):
			records = [_record_or_records]
		elif isinstance(_record_or_records, list):
			records = _record_or_records
			
		if self.backend:
			self.logger.debug("Put %s record(s) ..." % len(records))
			for record in records:
				_id = record._id
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
							record.write_time = time.time()
							ret = self.backend.update({'_id': _id}, {"$set": record.dump()}, upsert=True, safe=self.mongo_safe)
						except Exception, err:
							self.logger.error("Impossible to store !\nReason: %s" % err)
							self.logger.debug("Record dump:\n%s" % record.dump())

						if self.mongo_safe:
							if ret['updatedExisting']:
								self.logger.debug("Successfully updated (_id: '%s')" % _id)
							else:
								self.logger.debug("Successfully saved (_id: '%s')" % _id)
	
						record._id = _id
						return_ids.append(_id)
					else:
						self.logger.error("Puts: Access denied ...")
				else:
				## Insert
					if not record.owner:
						record.owner = account.user
					if not record.group:
						record.group = account.group
			
					try:
						record.write_time = time.time()
						_id = self.backend.insert(record.dump(), safe=self.mongo_safe)
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
		else:
			self.logger.error("No backend found ...")


	def find(self, mfilter={}, mfields=None, account=None):
		if not account:
			account = self.default_account

		(Read_mfilter, Write_mfilter) = self.make_mongofilter(account)

		self.logger.debug("Find '%s' records ..." % mfilter)

		mfilter = dict(mfilter.items() + Read_mfilter.items())

		raw_records = self.backend.find(mfilter, safe=self.mongo_safe)
		
		records=[]
		for raw_record in raw_records:
			try:
				records.append(crecord(raw_record=raw_record))
			except:
				## Not record format ...
				pass

		self.logger.debug("Found %s record(s)" % len(records))
		return records

	def get(self, _id_or_ids, account=None):
		if not account:
			account = self.default_account

		if isinstance(_id_or_ids, dict):
			_id = [_id_or_ids]
		else:
			_id = _id_or_ids

		if self.backend:
			self.logger.debug(" + Get record '%s'" % _id)
			try:
				#record = self.backend.find_one({'_id': str(_id)}, safe=self.mongo_safe)
				try:
					oid = objectid.ObjectId(_id)
				except:
					oid = _id
				raw_record = self.backend.find_one({'_id': oid}, safe=self.mongo_safe)
			except Exception, err:
				self.logger.error("Impossible get record '%s' !\nReason: %s" % (_id, err))

			if not raw_record:
				raise KeyError("'%s' not found ..." % _id)

			return crecord(raw_record=raw_record)
			
		else:
			self.logger.error("No backend found ...")

	def remove(self, _id_or_ids, account=None):
		if not account:
			account = self.default_account

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

		if self.backend:
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
						self.backend.remove({'_id': oid}, safe=self.mongo_safe)
					except Exception, err:
						self.logger.error("Impossible remove record '%s' !\nReason: %s" % (_id, err))
				else:				
					self.logger.error("Remove: Access denied ...")
					raise ValueError("Access denied ...")
				
		else:
			self.logger.error("No backend found ...")		

	def drop_namespace(self, namespace):
		self.db.drop_collection(namespace)		

	def __del__(self):
		self.logger.debug("Object deleted.")



#####
#       docs = doc_or_docs
#        return_one = False
#        if isinstance(docs, dict):
#            return_one = True
#            docs = [docs]	
##################


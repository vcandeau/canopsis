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
from crecord_ng import crecord_ng

from ccache import ccache
from ctimer import ctimer
from ctools import calcul_pct
from pymongo import objectid

from caccount import caccount
from cstorage import get_storage

import time
import json
import logging


class cselector(crecord_ng):
	def __init__(self, namespace='inventory', type='selector',  mids=[], mfilter=None, logging_level=logging.INFO, *args, **kargs):

		## Default vars
		self.namespace = namespace
		self.mfilter = mfilter
		self.mids = mids
		self.timer = ctimer(logging_level=logging.INFO)
		self.nocache = False
		self.cache_time = 60
		self.last_resolv_time = 0
		self.last_nb_records = 0

		self._ids = []
		
		## Init
		crecord_ng.__init__(self, type=type, *args, **kargs)

	def dump(self):
		self.data['mids'] = self.mids
		self.data['namespace'] = self.namespace
		self.data['mfilter'] = json.dumps(self.mfilter)
		return crecord_ng.dump(self)

	def load(self, dump):
		crecord_ng.load(self, dump)
		self.mfilter = json.loads(self.data['mfilter'])
		self.namespace = self.data['namespace']
		self.mids = self.data['mids']

	def resolv(self, nocache=False):

		if not (nocache or self.nocache):
			# check cache freshness
			if (self.last_resolv_time + self.cache_time) > time.time():
				return self.records

		_ids = []

		records = []
		
		if self.mfilter or self.mfilter == {}:	
			records = self.storage.find(self.mfilter, namespace=self.namespace)

		if self.mids:
			for mid in self.mids:
				try:
					records.append(self.storage.get(mid, namespace=self.namespace))
				except:
					self.logger.error("'%s' not found in '%s' ..." % (mid, self.namespace))

		state = 0
		for record in records:
			try:
				#print "%s: %s" % (record._id, record.data['state'])
				if record.data['state'] > state:
					state = record.data['state']
			except:
				pass
			_ids.append(record._id)

		self.state = state

		# Put in cache
		#self.cache.put(self._id, _ids)

		#self.last_resolv_time = self.timer.elapsed
		self.last_nb_records = len(records)

		self._ids = _ids
		self.records = records

		self.save()

		return records

	def match(self, _id):
		self.resolv()

		try:
			oid = objectid.ObjectId(_id)
		except:
			oid = _id

		if oid in self._ids:
			return True

		return False


#	def cat(self):
#		print "Id:\t\t\t", self._id
#		print "Mfilter:\t\t", self.data['mfilter']
#		print "Last Resolv Time:\t%.2f ms" % (self.data['last_resolv_time']*1000)
#		print "Last Nb records:\t", self.data['last_nb_records'], "\n"


#################

#def cselector_getall(storage):
#	selectors = []
#	records = storage.find({'crecord_type': 'selector'})
#	for record in records:
#		selectors.append(cselector(record))
#	
#	return selectors

#def cselector_get(storage, user):
#	record = storage.get('account-'+user)
#	selector = cselector(record)
#	return selector
	

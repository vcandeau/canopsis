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

import logging
import time
import hashlib

from pyperfstore.metric import metric
from pyperfstore.dca import dca
from pyperfstore.pmath import aggregate

class node(object):
	def __init__(self, dn, storage, point_per_dca=None, retention=None, rotate_plan=None):
		self.logger = logging.getLogger('node')

		self.logger.debug("Init node '%s'" % dn)

		self.dn = dn
		self._id = dn

		self.retention = retention

		self.point_per_dca = point_per_dca
		self.rotate_plan = rotate_plan

		self.storage = storage

		self.metrics = {}
		self.metrics_id = {}

		self.writetime = None

		data = self.storage.get(self._id)
		if data:
			self.load(data)

	def dump(self):
		dump = {
			'id':		self._id,
			'dn':		self.dn,
			'retention':	self.retention,
			'point_per_dca':self.point_per_dca,
			'rotate_plan':	self.rotate_plan,
			'metrics':		self.metrics,
			'metrics_id':	self.metrics_id,
			'writetime':	time.time()
		}

		for _id in self.metrics.keys():
			item = self.metrics[_id]
			if isinstance(item ,metric):
				item.save()
				dump['metrics'][_id] = { 'id': item._id, 'bunit': item.bunit }
			else:
				dump['metrics'][_id] = { 'id': item['id'], 'bunit': item['bunit'] }
			
		return dump

	def load(self, data):
		self.logger.debug("Load node '%s'" % self._id)

		self._id		= data['id']
		self._dn		= data['dn']
		self.retention		= data['retention']
		self.point_per_dca	= data['point_per_dca']
		self.rotate_plan	= data['rotate_plan']
		
		self.writetime		= data['writetime']
		self.metrics = data['metrics']
		
		## For compatibility
		try:
			self.metrics_id		= data['metrics_id']
			
		except Exception, err:
			self.logger.warning("Convert Node in new format !")
			convert_node(self)
			self.save()
			
	def save(self):
		dump = self.dump()

		self.logger.debug("Save node '%s'" % self._id)
		self.storage.set(self._id, dump)

	def metric_make_id(self, dn):
		return self._id.replace('.','-') + "-" + hashlib.md5(dn).hexdigest()

	def metric_get(self, dn=None, _id=None):
		_id = self.metric_get_id(dn, _id)
		
		if not _id:
			self.logger.error("Unknown metric '%s' ... " % dn)
			return None
			
		item = self.metrics[_id]

		if not isinstance(item ,metric):
			## load metric from store
			item = metric(_id=item['id'], node=self, storage=self.storage)
			self.metrics[_id] = item

		return item


	def metric_get_all_dn(self):
		return [ dn for dn in self.metrics_id.keys() ]


	def metric_get_id(self, dn=None, _id=None):
		if _id:
			return _id
		
		if not dn:
			return None

		return self.metric_idBydn(dn)

	def metric_idBydn(self, dn):
		try:
			return self.metrics_id[dn]
		except:
			return None
		
	def metric_dump(self, dn=None, _id=None):
		_id = self.metric_get_id(dn, _id)
		
		item = self.metrics[_id]

		if isinstance(item ,metric):
			## load metric from store
			return item.dump()

		return self.metric_get(_id=_id).dump()


	def metric_exist(self, dn=None, _id=None):	
		_id = self.metric_get_id(dn, _id)
		
		if not _id:
			return False
			
		try:		
			return self.metrics[_id]
		except:
			return False

	def metric_add(self, dn, bunit=None, dtype=None):
		self.logger.debug("Add metric '%s' (%s)" % (dn, bunit))

		if not self.metric_exist(dn=dn):
			metric_id = self.metric_make_id(dn)

			self.logger.debug(" + Metric ID: '%s'" % metric_id)
			self.metrics[metric_id] = metric(
							_id=metric_id,
							dn=dn,
							bunit=bunit,
							dtype=dtype,
							node=self,
							retention=self.retention,
							storage=self.storage,
							point_per_dca=self.point_per_dca,
							rotate_plan=self.rotate_plan,
						)
						
			self.metrics_id[dn] = metric_id
			
			self.save()
		else:
			self.logger.debug(" + Metric allready exist")
			metric_id = self.metric_get_id(dn=dn)
		
		return metric_id


	def metric_get_values(self, tstart, tstop=None, auto_aggregate=True, dn=None, _id=None):
		_id = self.metric_get_id(dn, _id)
		if not _id:
			return []
		
		if not tstop:
			tstop = int(time.time())

		tstart = int(tstart)
		tstop = int(tstop)

		self.logger.debug("Get values in '%s'" % dn)

		mymetric = self.metric_get(_id=_id)

		if mymetric:
			values = mymetric.get_values(tstart, tstop)
			if auto_aggregate:
				return aggregate(values)
			else:
				return values
		else:
			return []
	

	def metric_push_value(self, value, unit=None, timestamp=None, dn=None, _id=None, dtype=None):
		_id = self.metric_get_id(dn, _id)
		
		self.logger.debug("Push value on metric '%s' (_id: %s)" % (dn, _id))
		
		if not _id:
			_id = self.metric_add(dn=dn, bunit=unit, dtype=dtype)
			
		if not timestamp:
			timestamp = int(time.time())
		else:
			timestamp = int(timestamp)
			
		mymetric = self.metric_get(_id=_id)
		
		## re-Set dtype
		if dtype:
			if mymetric.dtype != dtype:
				mymetric.dtype = dtype
				
		## re-Set bunit
		if unit:
			if mymetric.bunit != unit:
				mymetric.bunit = unit

		mymetric.push_value(value=value, timestamp=timestamp)

	def metric_remove(self, dn=None, _id=None):
		self.logger.debug("Remove metric '%s'" % dn)
		
		_id = self.metric_get_id(dn, _id)
		if not _id:
			return None
			
		mymetric = self.metric_get(_id=_id)
		
		dn = mymetric.dn
		
		mymetric.dca_remove_all()
		self.storage.rm(_id)

		del self.metrics_id[dn]
		del self.metrics[_id]
		del mymetric
	
		self.save()
		
	def metric_remove_all(self):
		for _id in self.metrics.keys():
			item = self.metric_get(_id=_id)
			self.metric_remove(_id=_id)

	def remove(self):
		self.metric_remove_all()

		self.logger.debug("Remove node '%s'" % self._id)
		self.storage.rm(self._id)

	def pretty_print(self):
		print " + Id: %s" % self._id
		print " + Node: %s" % self.dn
		print " + Retention: %s" % self.retention
		print " + Metrics:"

		for _id in self.metrics.keys():

			metric = self.metric_get(_id=_id)

			print "    + %s (%s) (%s)" % (metric.dn, metric.dtype, metric._id)

			item = metric.dca_get(metric.current_dca)
			print "      + Current DCA (%s -> %s),\tPoints: %s" % (item.tstart, item.tstop, item.size )
			print ""

			if metric.dca_PLAIN:
				for item in metric.dca_PLAIN:
					item = metric.dca_get(item)
					print "      + %s DCA (%s -> %s),\tPoints: %s" % (item.format, item.tstart, item.tstop, item.size )

				print ""

			if metric.dca_TSC:
				for item in metric.dca_TSC:
					item = metric.dca_get(item)
					print "      + %s DCA (%s -> %s),\tPoints: %s" % (item.format, item.tstart, item.tstop, item.size )

				print ""

			if metric.dca_ZTSC:
				for item in metric.dca_ZTSC:
					item = metric.dca_get(item)
					print "      + %s DCA (%s -> %s),\tPoints: %s" % (item.format, item.tstart, item.tstop, item.size )

				print ""



def convert_node(node):
	metrics = {}
	node.logger.debug("Convert %s" % node._id)
	for dn in node.metrics.keys():
		metric_raw = node.metrics[dn]
		ometric = metric(_id=metric_raw['id'], node=node, storage=node.storage)
		
		_id = node.metric_make_id(dn)
		
		node.logger.debug(" + %s (%s)" % (dn, _id))
		
		ometric._id = _id
		ometric.save()
		
		metrics[_id] = ometric

		node.metrics_id[dn] = _id
		
	node.metrics = metrics

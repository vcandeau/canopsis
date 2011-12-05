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

from pyperfstore.metric import metric
from pyperfstore.dca import dca

class node(object):
	def __init__(self, dn, storage, point_per_dca=300, retention=None, rotate_plan=None):
		self.logger = logging.getLogger('node')

		self.logger.debug("Init node '%s'" % dn)

		self.dn = dn
		self._id = dn

		self.retention = retention

		self.point_per_dca = point_per_dca
		self.rotate_plan = rotate_plan

		self.storage = storage

		self.metrics = {}

		self.writetime = None

		data = self.storage.get(self._id)
		if data:
			self.load(data)

		## create lock

	#def __del__(self):
		## release lock
		#self.save()
	#	pass

	def dump(self):
		dump = {
			'id':		self._id,
			'dn':		self.dn,
			'retention':	self.retention,
			'point_per_dca':self.point_per_dca,
			'rotate_plan':	self.rotate_plan,
			'metrics':	self.metrics,
			'writetime':	time.time()
		}

		for dn in self.metrics.keys():
			item = self.metrics[dn]
			if isinstance(item ,metric):
				item.save()
				dump['metrics'][dn] = { 'id': item._id, 'bunit': item.bunit }
			else:
				dump['metrics'][dn] = { 'id': item['id'], 'bunit': item['bunit'] }

		return dump

	def load(self, data):
		self.logger.debug("Load node '%s'" % self._id)

		self._id		= data['id']
		self._dn		= data['dn']
		self.retention		= data['retention']
		self.point_per_dca	= data['point_per_dca']
		self.rotate_plan	= data['rotate_plan']

		self.metrics		= data['metrics']

		self.writetime		= data['writetime']

	def save(self):
		dump = self.dump()

		self.logger.debug("Save node '%s'" % self._id)
		self.storage.set(self._id, dump)

	def metric_get_id(self, dn):
		return self._id + "-" + dn

	def metric_get(self, dn):
		item = None
		try:
			item = self.metrics[dn]

			if not isinstance(item ,metric):
				## load metric from store
				item = metric(_id=item['id'], node=self, storage=self.storage)
				self.metrics[dn] = item
		except:
			self.logger.error("Unknown metric '%s' ... " % dn)

		return item


	def metric_get_all_dn(self):
		return [ dn for dn in self.metrics.keys() ]
		

	def metric_dump(self, dn):
		item = self.metrics[dn]

		if isinstance(item ,metric):
			## load metric from store
			return item.dump()

		return self.metric_get(dn).dump()


	def metric_exist(self, dn):
		try:
			self.metrics[dn]
			return True
		except:
			return False

	def metric_add(self, dn, bunit=None):
		self.logger.debug("Add metric '%s' (%s)" % (dn, bunit))

		if not self.metric_exist(dn):
			metric_id = self.metric_get_id(dn)

			self.logger.debug(" + Metric ID: '%s'" % metric_id)
			self.metrics[dn] = metric(
							_id=metric_id,
							dn=dn,
							bunit=bunit,
							node=self,
							retention=self.retention,
							storage=self.storage,
							point_per_dca=self.point_per_dca,
							rotate_plan=self.rotate_plan,
						)

			self.save()
		else:
			self.logger.debug(" + Metric allready exist")


	def metric_get_values(self, dn, tstart, tstop=None):
		if not tstop:
			tstop = int(time.time())

		self.logger.debug("Get values in '%s'" % dn)

		mymetric = self.metric_get(dn)

		if mymetric:
			return mymetric.get_values(tstart, tstop)
		else:
			return []
	

	def metric_push_value(self, dn, value, unit=None, timestamp=None):
		self.logger.debug("Push value on metric '%s'" % dn)

		if not timestamp:
			timestamp = int(time.time())
		else:
			timestamp = int(timestamp)

		if not self.metric_exist(dn):
			self.metric_add(dn=dn, bunit=unit)

		mymetric = self.metric_get(dn)

		mymetric.push_value(value=value, timestamp=timestamp)

	def metric_remove(self, dn):
		self.logger.debug("Remove metric '%s'" % dn)

		mymetric = self.metric_get(dn)

		mymetric.dca_remove_all()
		self.storage.rm(mymetric._id)

		del self.metrics[dn]
		del mymetric
	
		self.save()
		
	def metric_remove_all(self):
		for dn in self.metrics.keys():
			item = self.metric_get(dn)
			self.metric_remove(item.dn)

	def remove(self):
		self.metric_remove_all()

		self.logger.debug("Remove node '%s'" % self._id)
		self.storage.rm(self._id)

	def pretty_print(self):
		print " + Id: %s" % self._id
		print " + Node: %s" % self.dn
		print " + Retention: %s" % self.retention
		print " + Metrics:"

		for dn in self.metrics.keys():

			metric = self.metric_get(dn)

			print "    + %s" % metric.dn

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

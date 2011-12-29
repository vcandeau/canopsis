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

import logging, time
import random
from operator import itemgetter

from pyperfstore.dca import dca
from pyperfstore.pmath import dichot, estimate_index, search_index, get_timestamp_interval, in_range

class metric(object):
	def __init__(self, _id, storage, node, dn=None, bunit=None, retention=None, point_per_dca=None, rotate_plan=None):
		self.logger = logging.getLogger('metric')

		self.logger.debug("Init metric '%s'", _id)

		self.current_dca = None

		self._id = _id
		self.node = node
		self.node_id = node._id
		self.dn = dn
		self.bunit = bunit

		self.point_per_dca = point_per_dca
		self.auto_point_per_dca = True
		self.min_point_per_dca = 300 #points
		self.max_point_per_dca = 1500 #points
		self.dca_time_window = 86400 #seconds
		self.interval = 300 #seconds
		
		self.storage = storage

		self.dca_PLAIN = []
		self.dca_TSC = []
		self.dca_ZTSC = []

		self.last_push = None

		self.writetime = None

		self.retention = retention

		if rotate_plan:
			self.rotate_plan = rotate_plan
		else:
			self.rotate_plan = {
				'PLAIN': 3,
				'TSC': 5,
			}

		if not dn:
			data = self.storage.get(self._id)
			if data:
				self.load(data)
			else:
				raise Exception('Invalid arguments or Invalid data ...')

		if self.point_per_dca:
			self.auto_point_per_dca = False

	#def __del__(self):
	#	#self.save()
	#	pass

	def dump(self):
		current_dca = self.current_dca
		if isinstance(current_dca ,dca):
			current_dca = current_dca.dump()

		dump = {
			'id':		self._id,
			'dn':		self.dn,
			'node_id':	self.node_id,
			'bunit':	self.bunit,
			'retention':	self.retention,
			'point_per_dca':self.point_per_dca,
			'interval':	self.interval,
			'rotate_plan':	self.rotate_plan,
			'current_dca':	current_dca,
			'writetime':	time.time()
		}

		dump['dca_PLAIN'] = []
		dump['dca_TSC'] = []
		dump['dca_ZTSC'] = []

		for item in self.dca_PLAIN:
			if isinstance(item ,dca):
				dump['dca_PLAIN'].append(item.dump())
			else:
				dump['dca_PLAIN'].append(item)

		for item in self.dca_TSC:
			if isinstance(item ,dca):
				dump['dca_TSC'].append(item.dump())
			else:
				dump['dca_TSC'].append(item)

		for item in self.dca_ZTSC:
			if isinstance(item ,dca):
				dump['dca_ZTSC'].append(item.dump())
			else:
				dump['dca_ZTSC'].append(item)

		return dump

	def load(self, data):
		self.logger.debug("Load metric '%s'" % self._id)

		self._id		= data['id']
		self.dn			= data['dn']
		self.retention		= data['retention']
		self.point_per_dca	= data['point_per_dca']

		self.node_id		= data['node_id']
		self.bunit		= data['bunit']
		self.rotate_plan	= data['rotate_plan']

		self.interval		= data['interval']
	
		if data['current_dca']:
			self.current_dca	= self.dca_get(data['current_dca'])
		else:
			self.current_dca	= None

		self.dca_PLAIN		= data['dca_PLAIN']
		self.dca_TSC		= data['dca_TSC']
		self.dca_ZTSC		= data['dca_ZTSC']

		self.writetime		= data['writetime']
	
	def save(self):
		dump = self.dump()

		self.logger.debug(" + Save metric '%s'" % self._id)
		self.storage.set(self._id, dump)

	def dca_remove_all(self):
		self.logger.debug(" + Remove all DCA")

		item = self.dca_get(self.current_dca)
		self.storage.rm(item.values_id)
		del item		

		for item in self.dca_PLAIN:
			item = self.dca_get(item)
			self.storage.rm(item.values_id)
			del item

		for item in self.dca_TSC:
			item = self.dca_get(item)
			self.storage.rm(item.values_id)
			del item

		for item in self.dca_ZTSC:
			item = self.dca_get(item)
			self.storage.rm(item.values_id)
			del item

	def dca_have_timestamp(self, item, tstart, tstop):
		if isinstance(item ,dca):
			item = item.dump()

		if item['tstop']:
			t1 = in_range(tstart, item['tstart'], item['tstop']) or in_range(tstop, item['tstart'], item['tstop'])
			t2 = in_range(item['tstart'], tstart, tstop) or in_range(item['tstop'], tstart, tstop)
			return t1 or t2
		else:
			return tstart >= item['tstart'] or tstop >= item['tstart']	

	def get_values(self, tstart, tstop=None):
		## TODO: Improve search performance !

		if not tstop:
			tstop = int(time.time())
		
		self.logger.debug("get_value:")
		self.logger.debug(" + %s -> %s" % (tstart, tstop))

		dcas = []

		# check current dca
		item = self.current_dca
		if self.dca_have_timestamp(item, tstart, tstop):
			item = self.dca_get(item)
			self.logger.debug("   + Add current DCA\t(%s)" % item._id)
			dcas.append(item)

		#check plain
		for item in self.dca_PLAIN:
			if self.dca_have_timestamp(item, tstart, tstop):
				item = self.dca_get(item)
				self.logger.debug("   + Add PLAIN DCA\t\t(%s)" % item._id)
				dcas.append(item)

		#check tsc
		for item in self.dca_TSC:
			if self.dca_have_timestamp(item, tstart, tstop):
				item = self.dca_get(item)
				self.logger.debug("   + Add TSC DCA\t\t(%s)" % item._id)
				dcas.append(item)

		#check ztsc
		for item in self.dca_ZTSC:
			if  self.dca_have_timestamp(item, tstart, tstop):
				item = self.dca_get(item)
				self.logger.debug("   + Add ZTSC DCA\t\t(%s)" % item._id)
				dcas.append(item)

		self.logger.debug(" + Found %s DCAs" % len(dcas))

		if len(dcas) == 0:
			return []

		values = []
		for item in dcas:
			item = self.dca_get(item)
			dca_values = item.get_values()
	
			if dca_values:
				self.logger.debug(" + Parse values of %s (%s -> %s (%s points))" % (item._id, item.tstart, item.tstop, len(dca_values)))

				parse_values = True

				# if all values are in range
				if item.tstart and item.tstop:
					if in_range(item.tstart, tstart, tstop) and in_range(item.tstop, tstart, tstop):
						self.logger.debug(" + Append All values")
						values += dca_values
						parse_values = False			
		
				if parse_values:
					if tstart <= dca_values[0][0]:
						itstart = 0
					else:
						itstart =  search_index(tstart, dca_values)

					self.logger.debug(" + Start index at %s" % itstart )

					if tstop >= dca_values[len(dca_values)-1][0]:
						itstop = len(dca_values)-1
					else:
						itstop =  search_index(tstop, dca_values)

					self.logger.debug(" + Stop index at %s", itstop)


					self.logger.debug(" + Append between index %s -> %s " % (itstart, itstop))

					if itstart == itstop:
						values += [ dca_values[itstart] ]
					else:
						values += dca_values[itstart:itstop+1]


		if values:
			values = sorted(values, key=itemgetter(0))
			if values[0][0] < tstart - 300:
				## set first value with old data
				values[0][0] = tstart

		return values


	def dca_get(self, mydca):
		if not isinstance(mydca ,dca):
			## load dca from store
			mydca = dca(raw=mydca, storage=self.storage)

		return mydca
		
	def dca_rotate(self):
		self.logger.debug("Rotate DCA")

		if len(self.dca_PLAIN) > self.rotate_plan['PLAIN']:
			item = self.dca_get(self.dca_PLAIN.pop(0))
			self.logger.debug("   + Rotate PLAIN, dca: '%s'" % item._id)
			item.compress_TSC()
			self.dca_TSC.append(item)

		if len(self.dca_TSC) > self.rotate_plan['TSC']:
			item = self.dca_get(self.dca_TSC.pop(0))
			self.logger.debug("   + Rotate TSC, dca: '%s'" % item._id)
			item.compress_ZTSC()
			self.dca_ZTSC.append(item)

		## Purge
		if self.retention and self.last_push and self.dca_ZTSC:			
			item = self.dca_ZTSC[0]
			if isinstance(item, dca):
				tstop = item.tstop
			else:
				tstop = item['metadata']['tstop']

			win_tstop = self.last_push - self.retention
			self.logger.debug(" + Check retention (last_push: %s, retention: %s, tstop: %s, win_tstop: %s)" % (self.last_push, self.retention, tstop, win_tstop))
			if tstop < win_tstop:
				self.logger.debug("   + Purge dca: '%s'" % item._id)
				#rm dca
				del self.dca_ZTSC[0]
		

	def dca_get_max_size(self):
		if not self.auto_point_per_dca and self.point_per_dca:
			return self.point_per_dca

		max_size = ((self.dca_time_window + 3000) / self.interval)

		if max_size > self.max_point_per_dca:
			max_size = self.max_point_per_dca
		elif max_size < self.min_point_per_dca:
			max_size = self.min_point_per_dca

		return max_size

	def dca_add(self):
		self.logger.debug("Add DCA")
		dca_id = "%s-%s-%s" % (self._id, str(int(time.time())), str(int(random.random() * 10000)) )

		if self.current_dca:
			self.dca_PLAIN.append(self.current_dca)


		max_size = self.dca_get_max_size()
		self.logger.debug(" + Max size %s" % max_size)
		self.current_dca = dca(	_id=dca_id,
					metric_id=self._id,
					storage=self.storage,
					max_size=max_size)

		self.dca_rotate()

		nb_PLAIN = len(self.dca_PLAIN)
		nb_TSC = len(self.dca_TSC)
		nb_ZTSC = len(self.dca_ZTSC)

		self.logger.debug(" + Nb PLAIN: %s" % nb_PLAIN)
		self.logger.debug(" + Nb TSC  : %s" % nb_TSC)
		self.logger.debug(" + Nb ZTSC : %s" % nb_ZTSC)

		self.save()
		#self.node.save()

	def push_value(self, value, timestamp):
		if not self.current_dca:
			self.dca_add()

		if self.current_dca.full:
			self.interval = get_timestamp_interval(self.current_dca.get_values())
			self.logger.debug(" + Current DCA interval: %s " % self.interval)
			self.dca_add()

		self.current_dca.push(value, timestamp)

		self.last_push = timestamp

		self.save()

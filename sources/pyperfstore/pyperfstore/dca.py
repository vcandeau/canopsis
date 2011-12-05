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

import sys, zlib, json, logging

class dca(object):
	def __init__(self, storage, _id=None, metric_id=None, raw=None):
		self.logger = logging.getLogger('dca')

		self._id = _id
		self.metric_id = metric_id
		self.format = "PLAIN"
		self.max_size = 300
		self.size = 0

		self.full = False

		self.storage = storage

		self.tstart = None
		self.tstop = None

		if raw:
			self.load(raw)
		else:
			if not metric_id or not _id:
				raise Exception('Invalid arguments ...')

		self.logger.debug("Init DCA '%s'" % self._id)

		self.values_id = self._id+"-values"

	def have_timestamp(self, tstart, tstop):
		if self.tstop:
			return tstart in range(self.tstart, self.tstop+1) or tstop in range(self.tstart, self.tstop+1) or self.tstart in range(tstart, tstop+1) or self.tstop in range(tstart, tstop+1)
		else:
			return tstart >= self.tstart or tstop >= self.tstart

	def dump(self):
		dump = {
			'id':		self._id,
			'metric_id':	self.metric_id,
			'tstart':	self.tstart,
			'tstop':	self.tstop,
			'format':	self.format,
			'max_size':	self.max_size,
			'size':		self.size,
			'values_id':	self.values_id
		}
		return dump

	def load(self, data):
		self._id	= data['id']
		self.metric_id	= data['metric_id']
		self.tstart	= data['tstart']
		self.tstop	= data['tstop']
		self.format	= data['format']
		self.max_size	= data['max_size']
		self.size	= data['size']
		self.values_id	= data['values_id']

	"""def save(self):
		dump = self.dump()

		self.logger.debug(" + Save dca '%s'" % self._id)
		self.storage.set(self._id, dump)
	"""

	def get_values(self):
		values =  self.storage.get(self.values_id)

		if not values:
			return []
		else:
			if   self.format == 'PLAIN':
				return values
			elif self.format == 'TSC':
				return self.uncompress_TSC(values=values)
			elif self.format == 'ZTSC':
				return self.uncompress_ZTSC(values=values)
			else:
				return None

	def get_values_size(self):
		return self.storage.size(self.values_id)

	def push(self, value, timestamp):
		if not self.tstart:
			self.tstart = timestamp

		self.logger.debug(" + %s: %s" % (timestamp, value))

		self.storage.append(self.values_id, [timestamp, value])
		self.size += 1

		if self.size >= self.max_size:
			self.logger.debug(" + DCA is full")
			self.tstop = timestamp
			self.full = True

	def compress_TSC(self, values=None):
		self.logger.debug("Timestamp compression")

		bsize = self.get_values_size()

		if self.format != "PLAIN":
			self.logger.error(" + Only compress PLAIN format ...")
			raise ValueError("Only compress PLAIN format ..")

		# Remplace timestamp by interval
		self.logger.debug(" + Remplace Timestamp by Interval and compress it")
		i = 0
		offset = self.tstart
		previous_interval = None

		if not values:
			values = self.get_values()

		#self.logger.debug(values)

		for point in values:
			#self.logger.debug(point)

			timestamp = point[0]
			value = point[1]

			if value == int(value):
				value = int(value)

			if i == 0:
				interval = timestamp - offset
				values[i] = value
			else:
				interval = timestamp - offset
				if interval == previous_interval:
					values[i] = value
				else:
					values[i][0] = interval
					previous_interval = interval

			offset = timestamp
			i += 1

		self.logger.debug(" + Json encode and compress it")
		values = json.dumps(values)
		values = values.replace(' ', '')

		asize = sys.getsizeof(values)

		ratio = int(((bsize-asize)*100)/bsize)

		self.logger.debug(" + Before:\t%s" % bsize)
		self.logger.debug(" + After:\t%s" % asize)
		self.logger.debug(" + Ratio:\t%s" % ratio)
		#self.logger.debug(self.values)

		self.format = "TSC"
		
		#self.save()
		self.storage.set_raw(self.values_id, values)

	def uncompress_TSC(self, values=None):
		self.logger.debug("Timestamp uncompression")

		#if self.format != "TSC":
		#	self.logger.error(" + Invalid TSC format")
		#	raise ValueError("Invalid TSC format")

		if not values:
			values = self.get_values()

		if type(values).__name__ == 'str' or type(values).__name__ == 'unicode':
			values = json.loads(values)

		if type(values).__name__ != 'list':
			raise ValueError("Invalid type (%s)" % type(values).__name__)

		#first point
		values[0] = [self.tstart, values[0]]

		#second point
		offset = values[1][0]
		timestamp = self.tstart + offset
		values[1] = [timestamp, values[1][1]]
		
		#others
		for i in range(2, len(values)):
			point = values[i]
			#self.logger.debug(point)

			timestamp = timestamp + offset

			if isinstance(point ,list):
				if point[0]:
					offset = point[0]
				values[i] = [ offset, point[1] ]
			else:
				values[i] = [ timestamp, point ]
		
		#self.format = "PLAIN"
		#self.values = values

		return values

	def compress_ZTSC(self, values=None):
		if self.format == "PLAIN":
			self.compress_TSC()

		self.logger.debug("Zlib Timestamp compression")

		if not values:
			values = self.storage.get_raw(self.values_id)

		bsize = self.get_values_size()

		values = zlib.compress(values, 9)

		asize = sys.getsizeof(values)

		ratio = int(((bsize-asize)*100)/bsize)

		self.logger.debug(" + Before:\t%s" % bsize)
		self.logger.debug(" + After:\t%s" % asize)
		self.logger.debug(" + Ratio:\t%s" % ratio)

		self.format = "ZTSC"

		self.storage.set_raw(self.values_id, values)

	def uncompress_ZTSC(self, values=None):
		self.logger.debug("Zlib Timestamp uncompression")

		#if self.format != "ZTSC":
		#	self.logger.error(" + Invalid ZTSC format")
		#	raise ValueError("Invalid ZTSC format")

		if not values:
			values = self.storage.get_raw(self.values_id)
		
		values = zlib.decompress(values)
		values = json.loads(values)

		#self.format = "TSC"

		values = self.uncompress_TSC(values)

		return values

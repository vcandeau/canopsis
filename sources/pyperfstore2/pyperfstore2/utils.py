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
logger = logging.getLogger('utils')

import zlib

import msgpack
packer = None

def compress(points):
	# Create packer
	if not packer:
		global packer
		packer = msgpack.Packer()
	
	# Remplace timestamp by interval
	logger.debug(" + Remplace Timestamp by Interval and compress it")
	i = 0
	offset = points[0][0]
	previous_interval = None

	for point in points:
		timestamp = point[0]
		value = point[1]
		
		# If int, dont store float
		if value == int(value):
			value = int(value)

		if i == 0:
			# first point
			interval = timestamp - offset
			points[i] = value
		else:
			# Others
			interval = timestamp - offset
			if interval == previous_interval:
				points[i] = value
			else:
				points[i][0] = interval
				previous_interval = interval

		offset = timestamp
		i += 1
	
	# Pack and compress points
	#points = packer.pack(points)
	points = zlib.compress(packer.pack(points), 9)

	return points

"""
def uncompress(self, values=None):
	self.logger.debug("TSC: Timestamp uncompression (%s)" % self.format)

	#if self.format != "TSC":
	#	self.logger.error(" + Invalid TSC format")
	#	raise ValueError("Invalid TSC format")

	#self.format = "TSC"
	
	if not values:
		values = self.storage.get_raw(self.values_id)
		
	self.logger.debug(" + Type of values: %s" % type(values))
	if type(values).__name__ != 'list':
		try:
			self.unpacker.feed(values)
			values = list(self.unpacker.unpack())
		except Exception, err:
			self.logger.warning("Values is not msgpack (%s)" % err)

			########################################################################
			######################### Decode OLD serialisation #####################
			########################################################################
			
			if type(values).__name__ == 'str' or type(values).__name__ == 'unicode':
				
				self.logger.debug("Decode old serialisation format (JSON) (%s)", self.format)
					
				try:
					values = json.loads(values)
				except Exception, err:
					#self.logger.error(values)
					self.logger.error("Values is not JSON (%s: %s)" % (type(values).__name__, err))
					raise ValueError("Invalid values (%s: %s)" % (type(values).__name__, err))
					
				try:							
					## Save with new format
					if self.format == "TSC":
						self.logger.info(" + Save TSC with new format")
						self.compress_TSC(self.uncompress_TSC(values))
						
					elif self.format == "ZTSC":
						self.format = "PLAIN"
						self.logger.info(" + Save ZTSC with new format")
						self.compress_ZTSC(self.compress_TSC(self.uncompress_TSC(values)))
						
				except Exception, err:
					#self.logger.error(values)
					raise ValueError("Impossible to save with new format (%s)" % err)
					
			########################################################################

	self.logger.debug(" + Type of values: %s" % type(values))
	if type(values).__name__ != 'list':
		raise ValueError("Invalid type (%s)" % type(values).__name__)

	#first point
	values[0] = [self.tstart, values[0]]

	#second point
	offset = values[1][0]
	timestamp = self.tstart + offset
	values[1] = [timestamp, values[1][1]]
	
	self.logger.debug(" + Offset: %s", offset)

	#others
	for i in range(2, len(values)):
		point = values[i]
		
		if isinstance(point ,list) or isinstance(point ,tuple):
			poffset = point[0]
			timestamp += poffset
			values[i] = [ timestamp, point[1] ]
		else:
			timestamp += offset
			values[i] = [ timestamp, point ]
			
		#self.logger.debug("%s -> %s" % (point, values[i]))
	
	#self.format = "PLAIN"
	return values
"""

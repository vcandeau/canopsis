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
unpacker = None


#### Utils fn

def get_first_point(points):
	if len(points):
		return points[0]
	else:
		return None

def get_last_point(points):
	if len(points):
		return points[len(points)-1]
	else:
		return None

def get_first_value(points):
	point = get_first_point(points)
	if point:
		return point[1]
	else:
		return None

def get_last_value(points):
	point = get_last_point(points)
	if point:
		return point[1]
	else:
		return None
		
def delta(points):
	vfirst = get_first_value(points)
	vlast = get_last_value(points)
	return vlast - vfirst

def median(vlist):
    values = sorted(vlist)
    count = len(values)

    if count % 2 == 1:
        return values[(count+1)/2-1]
    else:
        lower = values[count/2-1]
        upper = values[count/2]

    return (float(lower + upper)) / 2

def get_timestamp_interval(points):
	timestamp = 0
	timestamps=[]
	for point in points:
		timestamps.append(point[0] - timestamp)
		timestamp = point[0]

	if len(timestamps) > 1:
		del timestamps[0]

	return int(median(timestamps))

def get_timestamps(points):
	return [x[0] for x in points]

def get_values(points):
	return [x[1] for x in points]

def mean(vlist):
	if len(vlist):
		return float( sum(vlist) / float(len(vlist)))
	else:
		return 0.0

def vmean(vlist):
	vlist = get_values(vlist)
	return mean(vlist)

def vmin(vlist):
	vlist = get_values(vlist)
	return min(vlist)

def vmax(vlist):
	vlist = get_values(vlist)
	return max(vlist)


def derivs(vlist):
	return [vlist[i] - vlist[i - 1] for i in range(1, len(vlist) - 2)]

def parse_dst(points, dtype, first_point=[]):
	logger.debug("Parse Data Source Type %s on %s points" % (dtype, len(points)))
		
	if dtype == "DERIVE" or dtype == "COUNTER" or dtype == "ABSOLUTE":
		if points:
			rpoints = []
			values = get_values(points)
			i=0
			last_value=0
			counter = 0
			
			logger.debug('There is %s values' % len(values))
			
			for point in points:
				
				value = point[1]
				timestamp = point[0]
				
				previous_timestamp = None
				previous_value = None
				
				## Get previous value and timestamp
				if i != 0:
					previous_value 		= points[i-1][1]
					previous_timestamp	= points[i-1][0]
				elif i == 0 and first_point:
					previous_value		= first_point[1]
					previous_timestamp	= first_point[0]
				
				
				## Calcul Value
				if dtype != "COUNTER":
					if previous_value:
						if value > previous_value:
							value -= previous_value
						else:
							value = 0
				
				## Derive
				if previous_timestamp and dtype == "DERIVE":	
					interval = abs(timestamp - previous_timestamp)
					if interval:
						value = round(float(value) / interval, 3)
				
				## Abs
				if dtype == "ABSOLUTE":
					value = abs(value)
					
				## COUNTER
				if dtype == "COUNTER":
					value = value + counter
					counter = value

				## if new dca start, value = 0 and no first_point: wait second point ...
				if dtype == "DERIVE" and i == 0 and not first_point:
					## Drop this point
					pass
				else:
					rpoints.append([timestamp, value])
					
				i += 1
				
			return rpoints
	
	return points


def aggregate(values, max_points=None, interval=None, atype=None, agfn=None, mode=None):
	
	if not mode:
		mode = 'by_point'
	elif mode != 'by_point':
		mode = 'by_interval'
	
	if not max_points:
		max_points=1450
		
	if interval:
		interval = int(interval)
		mode = 'by_interval'
				
	if not atype:
		atype = 'MEAN'
	
	logger.debug("Aggregate %s points (max: %s, interval: %s, method: %s, mode: %s)" % (len(values), max_points, interval, atype, mode))

	if not agfn:
		if   atype == 'MEAN':
			agfn = vmean
		elif atype == 'FIRST':
			agfn = get_first_value
		elif atype == 'LAST':
			agfn = get_last_value
		elif atype == 'MIN':
			agfn = vmin
		elif atype == 'MAX':
			agfn = vmax
		elif atype == 'DELTA':
			agfn = delta
		elif atype == 'SUM':
			agfn = sum
		else:
			agfn = vmean

	logger.debug(" + Interval: %s" % interval)

	rvalues=[]
	
	if mode == 'by_point':
		if len(values) < max_points:
			logger.debug(" + Useless")
			return values
		
		interval = int(round(len(values) / float(max_points)))
		logger.debug(" + point interval: %s" % interval)
		
		for x in range(0, len(values), interval):
			sample = values[x:x+interval]
			value = agfn(sample)
			timestamp = sample[len(sample)-1][0]
			rvalues.append([timestamp, value])
		
	elif mode == 'by_interval':
		
		values_to_aggregate = []
		
		start = values[0][0]
		# modulo interval
		start -= start % interval
		stop = start + interval
		
		i=0
		for value in values:
			i+=1
			
			#compute interval
			if value[0] < stop:
				values_to_aggregate.append(value)
				
			# Check if last value
			if value[0] >= stop or i == len(values):
				#aggregate
				#timestamp = values_to_aggregate[0][0]
				logger.debug("   + %s -> %s (%s points)" % (start, stop, len(values_to_aggregate)))
				timestamp = stop
				
				if len(values_to_aggregate):
					agvalue = round(agfn(values_to_aggregate),2)
					point = [timestamp, agvalue]
					logger.debug("     + Point: %s" % point)
					rvalues.append(point)
				else:
					logger.debug("     + No values")
					rvalues.append([timestamp, agvalue])
			
				#Set next interval
				start = stop
				stop = start + interval
				
				# Push value
				values_to_aggregate = [value]
		
	logger.debug(" + Nb points: %s" % len(rvalues))
	return rvalues


def compress(points):
	logger.debug("Compress timeserie")
	
	# Create packer
	global packer
	if not packer:
		packer = msgpack.Packer()
	
	# Remplace timestamp by interval
	logger.debug(" + Remplace Timestamp by Interval and compress it")
	i = 0
	fts = points[0][0]
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
	
	data = (fts, points)
	# Pack and compress points
	#points = packer.pack(points)
	#points = zlib.compress(str(points), 9)
	points = zlib.compress(packer.pack(data), 9)
	

	return points

def uncompress(data):
	logger.debug("Uncompress timeserie")
	
	if not data:
		raise ValueError("Invalid data type (%s)" % type(data))

	# Create unpacker
	global unpacker
	if not unpacker:
		unpacker = msgpack.Unpacker(use_list=True)
	
	unpacker.feed(str(zlib.decompress(data)))
	data = unpacker.unpack()
	
	fts = data[0]
	points = data[1]
	
	logger.debug(" + Type of point: %s" % type(points))
	
	if type(points).__name__ != 'list':
		raise ValueError("Invalid type (%s)" % type(points))

	#first point
	points[0] = [fts, points[0]]

	#second point
	offset = points[1][0]
	timestamp = fts + offset
	points[1] = [timestamp, points[1][1]]
	
	logger.debug(" + Offset: %s", offset)

	#others
	for i in range(2, len(points)):
		point = points[i]
		
		if isinstance(point ,list) or isinstance(point ,tuple):
			poffset = point[0]
			timestamp += poffset
			points[i] = [ timestamp, point[1] ]
		else:
			timestamp += offset
			points[i] = [ timestamp, point ]
			
		#logger.debug("%s -> %s" % (point, values[i]))
	
	return points


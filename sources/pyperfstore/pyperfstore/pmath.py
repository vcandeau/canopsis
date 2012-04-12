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

import os, sys, json, logging
from math import sqrt

logger = logging.getLogger('pmath')
#logger.setLevel(logging.DEBUG)

# Dichotomie Algo
# http://python.jpvweb.com/mesrecettespython/doku.php?id=dichotomie
def dichot(x, L, comp=cmp, key=lambda c: c):
	i, j = 0, len(L)-1
	while i<j:
		k=(i+j)//2
		if comp(x,key(L[k][0]))<=0:
			j = k
		else:
			i = k+1

	return [comp(x,key(L[i][0])), i]

def in_range(value, start, stop):
	return value >= start and value < stop

def get_first_value(points):
	if len(points):
		return points[0]
	else:
		return None

def get_last_value(points):
	if len(points):
		return points[len(points)-1]
	else:
		return None

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
				
				## if new dca start, value = 0 and no first_point: wait second point ...
				if dtype == "DERIVE" and i == 0 and not first_point:
					## Drop this point
					pass
				else:
					rpoints.append([timestamp, value])
					
				i += 1
				
			return rpoints
	
	return points

def timesplit(points, tsfrom, tsto=None):
	logger.debug("Time split %s -> %s (%s points)" % (tsfrom, tsto, len(points)))

	before_point= []
	after_point = []
	first_point = get_first_value(points)
	last_point  = get_last_value(points)

	logger.debug("  + Data: %s -> %s (%s points)" % (first_point[0], last_point[0], len(points)))

	index_from = None
	index_to = None

	if tsto and tsfrom != tsto:
		if tsfrom >= tsto:
			raise ValueError, "'to' time must be superior to 'From' time"

		if tsfrom <= first_point[0] and tsto >= last_point[0]:
			logger.debug("  + No split, use all points")
			return ([], points, [])

		if tsfrom <= first_point[0]:
			logger.debug("  + %s is before first timestamp's point (%s)" % (tsfrom, first_point[0]))
			index_from = 0

		if tsto >= last_point[0]:
			logger.debug("  + %s is after last timestamp's point (%s)" % (tsto, last_point[0]))
			index_to = len(points)-1


		if index_from == None:
			(r_from, index_from) = dichot(tsfrom, points)
			#if index_from and index_from + r_from < len(points):
			#	index_from += r_from

		if index_to == None:
			(r_to, index_to) = dichot(tsto, points)
			#if index_to and index_to + r_to < len(points):
			#	index_to += r_to

		logger.debug("  + From: index=%s" % index_from)
		logger.debug("     + Points: %s" % points[index_from])
		logger.debug("  + To:   index=%s" % index_to)
		logger.debug("     + Points: %s" % points[index_to])

		if index_from != 0:
			before_point = points[index_from-1]
			
		if index_to + 1 < len(points):
			after_point = points[index_to+1]
		
		return (before_point, points[index_from:index_to+1], after_point)

	else:
		logger.debug("   + Return only one point")
		(r, index) = dichot(tsfrom, points)
		if index and index + r < len(points):
			index += r

		logger.debug("  + Index=%s" % index)
		logger.debug("     + Point: %s" % points[index])

		return ([], [points[index]], [])

## http://www.answermysearches.com/how-to-do-a-simple-linear-regression-in-python/124/
def linreg(X, Y):
	"""
	Summary
		Linear regression of y = ax + b
	Usage
		real, real, real = linreg(list, list)
	Returns coefficients to the regression line "y=ax+b" from x[] and y[], and R^2 Value
	"""
	logger.debug("Linear regression")
	if not len(X):
		logger.error(" + Empty list")
		return None

	if len(X) < 2:
		logger.error(" + You must have more than 2 points in your list")
		return None

	if len(X) != len(Y):  raise ValueError, 'unequal length'
	N = len(X)
	Sx = Sy = Sxx = Syy = Sxy = 0.0
	for x, y in map(None, X, Y):
		Sx = Sx + x
		Sy = Sy + y
		Sxx = Sxx + x*x
		Syy = Syy + y*y
		Sxy = Sxy + x*y
	det = Sxx * N - Sx * Sx
	a, b = (Sxy * N - Sy * Sx)/det, (Sxx * Sy - Sx * Sxy)/det
	meanerror = residual = 0.0
	for x, y in map(None, X, Y):
		meanerror = meanerror + (y - Sy/N)**2
		residual = residual + (y - a * x - b)**2
	RR = 1 - residual/meanerror
	ss = residual / (N-2)
	Var_a, Var_b = ss * N / det, ss * Sxx / det
	#print "y=ax+b"
	#print "N= %d" % N
	#print "a= %g \\pm t_{%d;\\alpha/2} %g" % (a, N-2, sqrt(Var_a))
	#print "b= %g \\pm t_{%d;\\alpha/2} %g" % (b, N-2, sqrt(Var_b))
	#print "R^2= %g" % RR
	#print "s^2= %g" % ss
	return a, b, RR


def aggregate(values, max_points=1450, interval=None, atype='MEAN', agfn=None):
	logger.debug("Aggregate %s points (max: %s)" % (len(values), max_points))

	if len(values) > max_points:
		if not interval:
			interval = int(round(len(values) / max_points))
	else:
		logger.debug(" + Useless")
		return values

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
		else:
			agfn = vmean

	logger.debug(" + Interval: %s" % interval)

	rvalues=[]
	for x in range(0, len(values), interval):
		sample = values[x:x+interval]
		value = agfn(sample)
		timestamp = sample[len(sample)-1][0]
 		rvalues.append([timestamp, value])

	logger.debug(" + Nb points: %s" % len(rvalues))
	return rvalues

def candlestick(values, window=86400):
	logger.debug("Candlestick")

	logger.debug(" + Window: %s" % window)

	"""first = get_first_value(values)[0]
	last  = get_last_value(values)[0]

	first = int(first/window)*window
	last = 	(int(last/window)+1)*window

	
	logger.debug(" + First: %s" % first)
	logger.debug(" + Last: %s" % last)
	
	rvalues = []
	index = 0
	for x in range(first, last-window, window):
		logger.debug("   + %s -> %s" % (x, x+window))
		data = values[index:]
		vdata = []
		for v in data:
			if v[0] in range(x, x+window+1):
				vdata.append(v)
				index += 1
			else:
				break

		rvalues.append(vdata)

	values = []
	for v in rvalues:
	"""
	vopen = get_first_value(values)[1]
	vclose = get_last_value(values)[1]
	vhight = vmax(values)
	vlow = vmin(values)
	timestamp = values[len(values)-1][0]
	#values.append([x, vopen, vclose, vlow, vhight])
	return [timestamp, vopen, vclose, vlow, vhight]


	#return values
		


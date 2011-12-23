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

logger = logging.getLogger('math')

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

def get_first_value(values):
	if len(values):
		return values[0]
	else:
		return None

def get_last_value(values):
	if len(values):
		return values[len(values)-1]
	else:
		return None

def estimate_index(x, L):
	first = get_first_value(L)[0]
	last = 	get_last_value(L)[0]
	delta = float(last - first)
	interval = int(round(delta / len(L), 0))
	logger.debug("   + First: %s, Last: %s, Estimated interval: %s" % (first, last, interval))
	if interval:
		multi = (x-first) / interval
	else:
		multi = 0
	
	if multi >= len(L):
		return len(L)-1
	else:
		return multi


def search_index(x, L):
	last_index = len(L)-1

	if x >= L[last_index][0]:
		logger.debug("   + %s is after last timestamp's point, index: %s" % (x, last_index))
		return last_index

	estimated = estimate_index(x, L)
	logger.debug("   + Estimated index: %s" % estimated)	
	
	## Ok if interval is regular
	margin = 3
	vstart = estimated - margin
	if not vstart or vstart < 0:
		vstart = 0

	vstop = estimated + margin
	if vstop > last_index:
		vstop = last_index

	if in_range(x, L[vstart][0], L[vstop][0]):

		#logger.debug("   + Use estimated index for reduce search time")
		#logger.debug("     + Search %s -> %s" % (vstart, vstop))
		#(r, index) = dichot(x, L[vstart:vstop])
		#index += r + vstart
		#logger.debug("     + r: %s, index: %s " % (r, index))

		logger.debug("   + Search %s between index %s -> %s" % (x, vstart,vstop))
		index = vstart
		for value in L[vstart:vstop+1]:
			logger.debug("     + %s: %s" % (index, L[index][0]))
			if x <= L[index][0]:
				return index
			index += 1

	else:
		logger.debug("   + Search %s by dichotomie on all values" % x)
		(r, index) = dichot(x, L)
		index += r
		logger.debug("     + r: %s, index: %s " % (r, index))
	
		return index

def median(values):
    values = sorted(values)
    count = len(values)

    if count % 2 == 1:
        return values[(count+1)/2-1]
    else:
        lower = values[count/2-1]
        upper = values[count/2]

    return (float(lower + upper)) / 2

def get_timestamp_interval(values):
	timestamp = 0
	timestamps=[]
	for x in values:
		timestamps.append(x[0] - timestamp)
		timestamp = x[0]

	if len(timestamps) > 1:
		del timestamps[0]

	return int(median(timestamps))

def get_values(values):
	return [x[1] for x in values]

def mean(values):
	if len(values):
		return float( sum(values) / float(len(values)))
	else:
		return 0.0

def vmean(values):
	values = get_values(values)
	return mean(values)

def vmin(values):
	values = get_values(values)
	return min(values)

def vmax(values):
	values = get_values(values)
	return max(values)


def derivs(vlist):
	return [vlist[i] - vlist[i - 1] for i in range(1, len(vlist) - 2)]



def aggregate(values, max_points=1450, atype='MEAN', agfn=None):
	logger.debug("Aggregate %s points (max: %s)" % (len(values), max_points))

	if len(values) > max_points:
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
		value = agfn(values[x:x+interval])
		timestamp = values[x][0]
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
		


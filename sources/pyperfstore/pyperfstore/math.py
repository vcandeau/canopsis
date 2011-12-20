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



def estimate_index(x, L):
	first = L[0][0]
	last = L[len(L)-1][0]
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

	if x >= L[vstart][0] and x <= L[vstop][0]:

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


def derivs(vlist):
	return [vlist[i] - vlist[i - 1] for i in range(1, len(vlist) - 2)]



def aggregate(values, max_points=1440, agfn=None):
	logger.debug("Aggregate %s points (max: %s)" % (len(values), max_points))

	if len(values) > max_points:
		interval = int(round(len(values) / max_points))
	else:
		logger.debug(" + Useless")
		return values

	if not agfn:
		agfn = vmean

	logger.debug(" + Interval: %s" % interval)

	rvalues=[]
	for x in range(0, len(values), interval):
		value = agfn(values[x:x+interval])
		timestamp = values[x][0]
 		rvalues.append([timestamp, value])

	logger.debug(" + Nb points: %s" % len(rvalues))
	return rvalues


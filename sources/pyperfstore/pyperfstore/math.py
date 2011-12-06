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
	interval = int(delta / len(L))
	logger.debug("   + First: %s, Last: %s, Estimated interval: %s" % (first, last, interval))
	if interval:
		multi = (x-first) / interval
	else:
		multi = 0

	return multi


def search_index(x, L):
	estimated = estimate_index(x, L)
	logger.debug("   + Estimated start index: %s" % estimated)	
	
	## Ok if interval is regular
	margin = 3
	vstart = estimated - margin
	if not vstart or vstart < 0:
		vstart = 0

	vstop = estimated + margin
	if vstop > len(L):
		vstop = len(L)

	if x >= L[vstart][0] and x <= L[vstop-1][0]:

		#logger.debug("   + Use estimated index for reduce search time")
		#logger.debug("     + Search %s -> %s" % (vstart, vstop))
		#(r, index) = dichot(x, L[vstart:vstop])
		#index += r + vstart
		#logger.debug("     + r: %s, index: %s " % (r, index))
	
		index = vstart
		for value in L[vstart:vstop]:
			if x < L[index][0]:
				return index - 1
			index += 1

	else:
		logger.debug("   + Search by dichotomie on all values")
		(r, index) = dichot(x, L)
		index += r
		logger.debug("     + r: %s, index: %s " % (r, index))
	
		return index


def drop_timestamp(values):
	return [values[i][1] for i in range(0, len(values))]

def mean(vlist):
	if vlist:
		return sum(vlist) / len(vlist)
	else:
		return 0

def derivs(vlist):
  return [vlist[i] - vlist[i - 1] for i in range(1, len(vlist) - 2)]


def mma(values):
	mma_values = []
	i=1
	for value in values:
		ts = value[0]
		nvalues = drop_timestamp(values[0:i])

		mma_values.append([ts, mean(nvalues) ])
		i+=1
	
	#print derivs(drop_timestamp(values))
	#print mma_values

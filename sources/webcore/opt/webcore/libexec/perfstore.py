#!/usr/bin/env python
# --------------------------------
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

import sys, os, logging, json, time

import bottle
from bottle import route, get, put, delete, request, HTTPError, response

#import protection function
from libexec.auth import check_auth, get_account

## Logger
if bottle.debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.INFO
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("rest")

# Modules
from pyperfstore import pmath
from pyperfstore import node
from pyperfstore import mongostore
from ctools import parse_perfdata

perfstore = mongostore(mongo_collection='perfdata')

#########################################################################

#### GET@
@get('/perfstore/node/:_id',apply=[check_auth])
def perfstore_node_get(_id):
	mynode = node(_id, storage=perfstore)

	output = [ mynode.dump() ]

	return {'total': len(output), 'success': True, 'data': output}

#### GET@
@get('/perfstore/values/:_id',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start/:stop',apply=[check_auth])
def perfstore_metric_get_values(_id, metrics="<all>", start=None, stop=None):

	if stop:
		stop = int(int(stop) / 1000)
	else:
		stop = int(time.time())
		
	if start:
		start = int(int(start) / 1000)
	else:
		start = stop - 86400

	data_type = request.params.get('data_type', default='line')

	if metrics:
		#small hack
		metrics = metrics.replace("<slash>", '/')

		metrics = metrics.split(',')
		logger.debug("GET:")
		logger.debug(" + _id:       %s" % _id)
		logger.debug(" + metrics:   %s" % metrics)
		logger.debug(" + start:     %s" % start)
		logger.debug(" + stop:      %s" % stop)
		logger.debug(" + data_type: %s" % data_type)

		output = []

		mynode = node(_id, storage=perfstore)

		if (metrics[0] == "<all>"):
			metrics = mynode.metric_get_all_dn()
			logger.debug(" + metrics:   %s" % metrics)

		for metric in metrics:
			
			if metric:
				try:
					values = mynode.metric_get_values(metric, start, stop)
					full_values = mynode.metric_get_values(metric, start, stop, auto_aggregate=False)
					## test
					### def aggregate(values, max_points=1450, atype='MEAN', agfn=None):
					if values:
						""""
						values_1h =  pmath.timesplit(values, values[len(values)-1][0] - 3600, values[len(values)-1][0])
						values_6h =  pmath.timesplit(values, values[len(values)-1][0] - 6 * 3600, values[len(values)-1][0])
						values_12h=  pmath.timesplit(values, values[len(values)-1][0] - 12 *3600, values[len(values)-1][0])
						values_week=  pmath.timesplit(values, values[len(values)-1][0] - 7 * 24 * 3600, values[len(values)-1][0])

						def trend(values):
							(a, b, RR) = pmath.linreg(pmath.get_timestamps(values), pmath.get_values(values))

							p1 = [values[0][0] * 1000, 				a * values[0][0] + b]
							p2 = [values[(len(values)-1)/2][0] * 1000,		a * values[(len(values)-1)/2][0] + b]
							p3 = [values[len(values)-1][0] * 1000,		a * values[len(values)-1][0] + b]
							return [p1, p2, p3]

						output.append({'metric': metric+'-trend-1h', 'values': trend(values_1h) })
						output.append({'metric': metric+'-trend-6h', 'values': trend(values_6h) })
						output.append({'metric': metric+'-trend-12h', 'values': trend(values_12h) })
						output.append({'metric': metric+'-trend-week', 'values': trend(values_week) })
						"""
						

						"""def agfn(values):
							(a, b, RR) = pmath.linreg(pmath.get_timestamps(values), pmath.get_values(values))
							if a != None:
								return (a * values[len(values)-1][0]) + b
							else:
								return 0

						trend = pmath.aggregate(full_values, agfn=agfn, interval=60)
						trend = [[x[0] * 1000, x[1]] for x in trend]
						output.append({'metric': metric+'-trend', 'values': trend })
						"""

					values = [[x[0] * 1000, x[1]] for x in values]
					if len(values) > 1:
						bunit = mynode.metric_get(metric).bunit
						output.append({'metric': metric, 'values': values, 'bunit': bunit })

				except Exception, err:
					logger.error(err)


		output = {'total': len(output), 'success': True, 'data': output}
		
	else:
		output = {'total': 0, 'success': False, 'data': []}
 
	return output

	
@get('/perfstore/metrics/:_id',apply=[check_auth])
def perfstore_getMetric(_id):

	logger.error("GET metrics of '%s'" % _id)

	mynode = node(_id, storage=perfstore)

	metrics = mynode.metric_get_all_dn()
	
	output = []
	if metrics:
		for metric in metrics:
			output.append({'metric': metric })
	
	output = {'total': len(output), 'success': True, 'data': output}
	
	return output
	

#@get('/perfstore_chart/:_id')
#@get('/perfstore_chart/:_id/:start')
#@get('/perfstore_chart/:_id/:start/:stop')
#response.content_type = 'image/svg+xml'


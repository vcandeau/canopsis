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
					if data_type == 'candlestick':
						window = 86400
						stop = 1324425600
						nb = 180
						data = []
						for i in range(nb):
							stop = stop - window
							values = mynode.metric_get_values(metric, stop-window, stop, auto_aggregate=False)
							if values:
								cdl = math.candlestick(values, window=window)
								cdl[0] = stop
								data.append(cdl)
					else:
						data = mynode.metric_get_values(metric, start, stop)

				
						logger.debug(" + Calcul Trend")
						y = pmath.get_values(data)
						x = pmath.get_timestamps(data)

						#y = ax + b
						(a, b, rr) = pmath.linreg(x, y)
						logger.debug("   + y = ax + b")
						logger.debug("   +   a: %s" % a)
						logger.debug("   +   b: %s" % b)
						logger.debug("   +  rr: %s" % rr)
						trend = []
						#if (len(x) >= 2):
						#	time = x[0]
						#	trend.append([time * 1000, (a*time+b)])
						#	time = x[len(x)-1]
						#	trend.append([time * 1000, (a*time+b)])
						
						if (trend):
							output.append({'metric': metric+'_trend', 'values': trend, 'bunit': None })	

				except Exception, err:
					logger.error(err)

				values = []

				if len(data) > 1:
					for value in data:
						value[0] = value[0] * 1000
						values.append(value)


				bunit = mynode.metric_get(metric).bunit

				output.append({'metric': metric, 'values': values, 'bunit': bunit })

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


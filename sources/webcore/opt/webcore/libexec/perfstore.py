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
def perfstore_metric_get_values(_id, metrics=None, start=None, stop=None):

	if stop:
		stop = int(int(start) / 1000)
	else:
		stop = int(time.time())
		
	if start:
		start = int(int(start) / 1000)
	else:
		start = stop - 86400

	if metrics:
		metrics = metrics.split(',')

		logger.debug("GET:")
		logger.debug(" + _id: "+str(_id))
		logger.debug(" + metrics: "+str(metrics))
		logger.debug(" + start: "+str(start))
		logger.debug(" + stop: "+str(stop))


		output = []

		mynode = node(_id, storage=perfstore)

		for metric in metrics:
			if metric:
				#data = perfstore.get(_id, metric, start, stop)
				try:
					data = mynode.metric_get_values(metric, start, stop)
				except Exception, err:
					print err

				values = []

				for value in data:
					values.append([value[0] * 1000, value[1]])

				output.append({'metric': metric, 'values': values })

		output = {'total': len(output), 'success': True, 'data': output}
		
	else:
		account = get_account()
		storage = get_storage(namespace='perfdata', logging_level=logging.DEBUG)
		data = storage.get(_id, account=account)
		
		output = []
		values = []
		if data:
			output = [ data.dump(json=True) ]
			"""
			for record in records:
				for metric in record['metrics']:
					output.append({'metric': metric })
			"""
		
		output = {'total': len(output), 'success': True, 'data': output}
 
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


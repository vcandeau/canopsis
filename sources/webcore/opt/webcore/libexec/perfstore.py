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

from StringIO import StringIO

## Canopsis
from cstorage import get_storage
from cperfstore import cperfstore

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

## Initialisation
perfstore = cperfstore(storage=get_storage(namespace='perfdata'), logging_level=logging_level)

#########################################################################

#### GET@
@get('/perfstore/:_id',apply=[check_auth])
@get('/perfstore/:_id/:metrics',apply=[check_auth])
@get('/perfstore/:_id/:metrics/:start',apply=[check_auth])
@get('/perfstore/:_id/:metrics/:start/:stop',apply=[check_auth])
def perfstore_get(_id, metrics=None, start=None, stop=None):

	if start:
		start = int(int(start) / 1000)

	if not stop:
		stop = int(time.time())

	if not start:
		start = stop - 86400
		#start = stop - 300

	if metrics:
		metrics = metrics.split(',')

		logger.debug("GET:")
		logger.debug(" + _id: "+str(_id))
		logger.debug(" + metrics: "+str(metrics))
		logger.debug(" + start: "+str(start))
		logger.debug(" + stop: "+str(stop))


		output = []

		for metric in metrics:
			if metric:
				data = perfstore.get(_id, metric, start, stop)

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

	
@get('/getMetric/:_id',apply=[check_auth])
def perfstore_getMetric(_id):
	account = get_account()
	storage = get_storage(namespace='perfdata', logging_level=logging.DEBUG)
	data = storage.get(_id, account=account)
	
	output = []
	values = []
	if data:
		records = [ data.dump(json=True) ]
		for record in records:
			for metric in record['metrics']:
				output.append({'metric': metric })
	
	output = {'total': len(output), 'success': True, 'data': output}
	
	return output

	
	
	
	
	
	
	
	
	
	

#@get('/perfstore_chart/:_id')
#@get('/perfstore_chart/:_id/:start')
#@get('/perfstore_chart/:_id/:start/:stop')
#response.content_type = 'image/svg+xml'


#!/usr/bin/env python
#https://beaker.groovie.org/

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
			records = [ data.dump(json=True) ]
			for record in records:
				for metric in record['metrics']:
					output.append({'metric': metric })
		
		output = {'total': len(output), 'success': True, 'data': output}
 
	return output
	
"""	
@get('/perfstore/:_id',apply=[check_auth])
def perfstore_get(_id):
	
	#get the session (security)
	account = get_account()
	
	storage = get_storage(namespace='perfdata', logging_level=logging.DEBUG)
	
	logger.debug("GET:")
	logger.debug(" + _id: "+str(_id))
	
	#data = perfstore.get(_id)
	data = storage.get(_id, account=account)
	
	#data['metrics']
	
	#output = []
	
	#output.append(data['metrics'])
	
	return output
"""
	
	
	
	
	
	
	
	
	
	

#@get('/perfstore_chart/:_id')
#@get('/perfstore_chart/:_id/:start')
#@get('/perfstore_chart/:_id/:start/:stop')
#response.content_type = 'image/svg+xml'


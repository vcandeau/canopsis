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
@get('/perfstore/:_id/:metric',apply=[check_auth])
@get('/perfstore/:_id/:metric/:start',apply=[check_auth])
@get('/perfstore/:_id/:metric/:start/:stop',apply=[check_auth])
def perfstore_get(_id, metric, start=None, stop=None):

	if start:
		start = int(int(start) / 1000)

	if not stop:
		stop = int(time.time())

	if not start:
		start = stop - 86400
		#start = stop - 300

	logger.debug("GET:")
	logger.debug(" + _id: "+str(_id))
	logger.debug(" + metric: "+str(metric))
	logger.debug(" + start: "+str(start))
	logger.debug(" + stop: "+str(stop))

	data = perfstore.get(_id, metric, start, stop)

	values = []

	for value in data:
		values.append([value[0] * 1000, value[1]])

	output = {'metric': metric, 'values': values }
	output = [output]
	output = {'total': len(output), 'success': True, 'data': output}
	
	#logger.debug(" + Output: "+str(output))

	return output


#@get('/perfstore_chart/:_id')
#@get('/perfstore_chart/:_id/:start')
#@get('/perfstore_chart/:_id/:start/:stop')
#response.content_type = 'image/svg+xml'


#!/usr/bin/env python

import sys, os, logging, json

import bottle
from bottle import route, get, put, delete, request, HTTPError

## Canopsis
from cstorage import get_storage
from libexec.auth import check_auth, get_account

## Logger
if bottle.debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.INFO
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("ui-menu")

#########################################################################

#### GET
@get('/ui/menu',apply=[check_auth])
def get_all_menu():
	_id = request.params.get('node', default=[])

	#if _id == 'root' means we want all menu
	if _id == 'root':
		_id = []

	account = get_account()
	storage = get_storage(namespace='object')
	
	#if _id == 'menu.view' catch all view, parsed them and give them in json
	if _id == 'menu.view':
		logger.debug('menu.view catched ------------------------------------------------->')
		mfilter = {'crecord_type': 'view'}
		
		records = storage.find(mfilter,account=account)
		#logger.debug(str(records))
		output = []
		for record in records:
			logger.debug(str(record.dump()))
			data = record.data
			#data['id'] = str(record._id)
			data['text'] = record.name
			data['view'] = record._id
			data['leaf'] = True
			output.append(data)
				
		output = json.dumps(output)
		#logger.debug(" + Output: "+str(output))
		return output
	###############

	logger.debug("Get menu:")
	logger.debug(" + Node: "+str(_id))

	records = storage.get_childs_of_parent(_id, rtype='menu', account=account)

	output = []
	for record in records:
		data = record.data
		data['id'] = str(record._id)
		data['text'] = record.name
		output.append(data)

	output = json.dumps(output)
	return output



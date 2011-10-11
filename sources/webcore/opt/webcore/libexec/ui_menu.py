#!/usr/bin/env python

import sys, os, logging, json
import ConfigParser

import bottle
from bottle import route, get, put, delete, request, HTTPError

## Canopsis
from cstorage import get_storage
from libexec.auth import check_auth, get_account

debug = True

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("ui-menu")

#########################################################################

#### GET
@get('/ui/menu',apply=[check_auth])
def get_all_menu():
	_id = request.params.get('node', default=[])

	if _id == 'root':
		_id = []

	account = get_account()
	storage = get_storage(namespace='object')

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



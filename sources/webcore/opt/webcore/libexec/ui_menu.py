#!/usr/bin/env python

import sys, os, logging, json
import ConfigParser

import bottle
from bottle import route, get, put, delete, request, HTTPError

## Canopsis
from caccount import caccount
from cstorage import cstorage
from crecord import crecord

## Initialisation

account = caccount(user="root", group="root")
storage = cstorage(account, namespace="object", logging_level=logging.INFO)

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
@get('/ui/menu')
def get_all_menu():
	_id = request.params.get('node', default=[])

	if _id == 'root':
		_id = []

	logger.debug("Get menu:")
	logger.debug(" + Node: "+str(_id))

	records = storage.get_childs_of_parent(_id, rtype='menu')

	output = []
	for record in records:
		data = record.data
		data['id'] = str(record._id)
		data['text'] = record.name
		output.append(data)

	output = json.dumps(output)
	return output



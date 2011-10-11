#!/usr/bin/env python

import sys, os, logging, json
import ConfigParser

import bottle
from bottle import route, get, put, delete, request, HTTPError

## Canopsis
from caccount import caccount
from cstorage import cstorage
from crecord import crecord

#import protection function
from libexec.auth import check_auth,get_account

## Initialisation

account = caccount(user="root", group="root")
storage = cstorage(account, namespace="object", logging_level=logging.INFO)

debug = False

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("rest")

#########################################################################

#### GET
@get('/rest/:namespace/:ctype/:_id',apply=[check_auth])
@get('/rest/:namespace/:ctype',apply=[check_auth])
@get('/rest/:namespace',apply=[check_auth])
def rest_get(namespace, ctype=None, _id=None):
	
	#get the session (security)
	account = get_account()
	
	limit = int(request.params.get('limit', default=20))
	page =  int(request.params.get('page', default=0))
	start =  int(request.params.get('start', default=0))
	groups = request.params.get('groups', default=None)
	search = request.params.get('search', default=None)

	logger.debug("GET:")
	logger.debug(" + namespace: "+str(namespace))
	logger.debug(" + Ctype: "+str(ctype))
	logger.debug(" + _id: "+str(_id))
	logger.debug(" + Limit: "+str(limit))
	logger.debug(" + Page: "+str(page))
	logger.debug(" + Start: "+str(start))
	logger.debug(" + Groups: "+str(groups))
	logger.debug(" + Search: "+str(search))

	mfilter = {}
	if ctype:
		mfilter = {'crecord_type': ctype}
	if _id:	
		try:
			records = [ storage.get(_id, namespace=namespace, account=account) ]
		except:
			return HTTPError(404, _id+" Not Found")
		
	else:
		records = storage.find(mfilter, namespace=namespace, limit=limit, offset=start, account=account)

	output = []
	for record in records:
		if record:
			data = record.dump(json=True)
			data['id'] = data['_id']
			output.append(data)

	output={'total': len(output), 'success': True, 'data': output}

	#logger.debug(" + Output: "+str(output))

	return output

#### PUT
@put('/rest/:namespace/:ctype',apply=[check_auth])
def rest_put(namespace, ctype):
	#get the session (security)
	account = get_account()
	
	logger.debug("PUT:")

	data = request.body.readline()
	if not data:
		HTTPError(400, "No data received")

	
	data = json.loads(data)
	data['crecord_type'] = ctype
	## Clean data
	_id = None
	try:
		_id = data['_id']
		#del data['_id']
	except:
		pass

	logger.debug(" + _id: "+str(_id))
	logger.debug(" + ctype: "+str(ctype))
	logger.debug(" + Data: "+str(data))

	record = crecord(raw_record=data)

	#print record.dump()

	storage.put(record, namespace=namespace)

#### DELETE
@delete('/rest/:namespace/:ctype/:_id',apply=[check_auth])
def rest_delete(namespace, ctype, _id):
	logger.debug("DELETE:")
	logger.debug(" + _id: "+str(_id))
	try:
		storage.remove(_id, namespace=namespace)
	except:
		HTTPError(404, _id+" Not Found")


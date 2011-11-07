#!/usr/bin/env python

import sys, os, logging, json

import bottle
from bottle import route, get, put, delete, request, HTTPError, post

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord

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
	logger.debug(" + User: "+str(account.user))
	logger.debug(" + Group(s): "+str(account.groups))
	logger.debug(" + namespace: "+str(namespace))
	logger.debug(" + Ctype: "+str(ctype))
	logger.debug(" + _id: "+str(_id))
	logger.debug(" + Limit: "+str(limit))
	logger.debug(" + Page: "+str(page))
	logger.debug(" + Start: "+str(start))
	logger.debug(" + Groups: "+str(groups))
	logger.debug(" + Search: "+str(search))

	storage = get_storage(namespace=namespace)

	mfilter = {}
	if ctype:
		mfilter = {'crecord_type': ctype}
	if _id:	
		try:
			records = [ storage.get(_id, account=account) ]
		except:
			return HTTPError(404, _id+" Not Found")
		
	else:
		if search:
			mfilter['_id'] = { '$regex' : '.*'+search+'.*', '$options': 'i' }
		records = storage.find(mfilter, limit=limit, offset=start, account=account)

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
@put('/rest/:namespace/:ctype', apply=[check_auth])
def rest_put(namespace, ctype):
	#get the session (security)
	account = get_account()
	storage = get_storage(namespace=namespace)

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

	storage.put(record, account=account)
	
#### POST
@post('/rest/:namespace/:ctype/:_id', apply=[check_auth])
@post('/rest/:namespace/:ctype', apply=[check_auth])
def rest_put(namespace, ctype, _id=None):
	#get the session (security)
	account = get_account()
	storage = get_storage(namespace=namespace)

	logger.debug("PUT:")

	data = request.body.readline()
	if not data:
		return HTTPError(400, "No data received")

	
	data = json.loads(data)
	data['crecord_type'] = ctype
	
	if not _id:
		try:
			_id = str(data['_id'])
		except:
			pass

		try:
			_id = str(data['id'])
		except:
			pass
	
	## Clean data
	try:
		del data['_id']
	except:
		pass

	try:
		del data['id']
	except:
		pass
	
	logger.debug(" + _id: "+str(_id))
	logger.debug(" + ctype: "+str(ctype))
	logger.debug(" + Data: "+str(data))

	update = False
	if _id:
		try:
			record = storage.get(_id ,account=account)
			logger.debug('Update record %s' % _id)
			update = True
		except:
			logger.debug('Create record %s' % _id)

	if update:
		for key in dict(data).keys():
			record.data[key] = data[key]
	else:
		raw_record = crecord(_id=_id, type=str(ctype)).dump()
		for key in dict(data).keys():
			raw_record[key] = data[key]

		record = crecord(raw_record=raw_record)
		record.chown(account.user)
		record.chgrp(account.group)

	storage.put(record, account=account)

#### DELETE
@delete('/rest/:namespace/:ctype/:_id',apply=[check_auth])
@delete('/rest/:namespace/:ctype',apply=[check_auth])
def rest_delete(namespace, ctype, _id=None):
	account = get_account()
	storage = get_storage(namespace=namespace)

	if not _id:
		data = request.body.readline()
		if not data:
			return HTTPError(400, "No data received")
		print data
		_id = None
		try:
			_id = str(data['_id'])
		except:
			pass
	
		try:
			_id = str(data['id'])
		except:
			pass

	if not _id:
		return HTTPError(404, "Id not found ...")

	logger.debug("DELETE:")
	logger.debug(" + _id: "+str(_id))
	try:
		storage.remove(_id, account=account)
	except:
		HTTPError(404, _id+" Not Found")


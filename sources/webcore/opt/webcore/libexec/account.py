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
logger = logging.getLogger('Account')

#########################################################################

#### GET Me
@get('/account/me',apply=[check_auth])
def account_get(_id=None):
	namespace = 'object'
	ctype= 'account'
	
	#get the session (security)
	account = get_account()

	storage = get_storage(namespace=namespace)

	try:
		records = [ storage.get(account._id, account=account) ]
	except:
		return HTTPError(404, _id+" Not Found")

	output = []
	for record in records:
		if record:
			data = record.dump(json=True)
			data['id'] = data['_id']
			output.append(data)

	output={'total': len(output), 'success': True, 'data': output}

	#logger.debug(" + Output: "+str(output))

	return output

#### GET
@get('/account/:_id',apply=[check_auth])
@get('/account/',apply=[check_auth])
def account_get(_id=None):
	namespace = 'object'
	ctype= 'account'
	
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

	
#### POST
@post('/account/', apply=[check_auth])
def account_put():
	#get the session (security)
	account = get_account()
	
	storage = get_storage(namespace='object')

	logger.debug("PUT:")

	data = request.body.readline()
	if not data:
		HTTPError(400, "No data received")

	
	data = json.loads(data)
	
	logger.debug(str(data))
	
	#create caccount with password
	new_account = caccount(user=str(data['user']), group=str(data['aaa_group']), firstname=str(data['firstname']),lastname=str(data['lastname']), mail=str(data['mail']), groups=str(data['groups']))
	new_account.passwd(str(data['passwd']))
	logger.debug('putting account in db ...')
	try:
		storage.put(new_account)
		logger.debug('account added in db')
	except:
		logger.debug('WARNING : failed to added account in db')


#### DELETE
@delete('/account/:_id',apply=[check_auth])
def account_delete(_id):
	account = get_account()
	storage = get_storage(namespace='object')

	logger.debug("DELETE:")
	logger.debug(" + _id: "+str(_id))
	try:
		storage.remove(_id, account=account)
		logger.debug('account removed')
	except:
		HTTPError(404, _id+" Not Found")

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
logger = logging.getLogger("ui-view")

#########################################################################

#### GET
@get('/ui/dashboard', apply=[check_auth])
def get_dashboard():
	namespace = 'object'
	
	#get the session (security)
	account = get_account()

	storage = get_storage(namespace=namespace)

	try:
		vid = account.data["dashboard"]
	except:
		vid = "view._default_.dashboard"

	logger.debug('Dashboard View: '+vid)

	try:
		record = storage.get(vid, account=account)
	except:
		logger.debug('View not found')
		return HTTPError(404, vid+" Not Found")

	output = []

	if record:
		data = record.dump(json=True)
		data['id'] = data['_id']
		output.append(data)

	output={'total': len(output), 'success': True, 'data': output}

	#logger.debug(" + Output: "+str(output))

	return output

### GET
@get('/ui/views', apply=[check_auth])
def get_tree_views():
	
	account = get_account()
	storage = get_storage(namespace='object')
	
	mfilter = {'crecord_type': 'view'}
		
	logger.debug('Get all views like a tree for ViewEditor')	
		
	records = storage.find(mfilter,account=account)
	output = []
	for record in records:
		#logger.debug(str(record.dump()))
		data = record.data
		#data['id'] = str(record._id)
		data['name'] = record.name
		data['id'] = record._id
		data['leaf'] = True
		output.append(data)
			
	output = json.dumps(output)
	#logger.debug(" + Output: "+str(output))
	return output

###POST
@post('/ui/views', apply=[check_auth])
def post_views_in_db():
	account = get_account()
	storage = get_storage(namespace='object')
	
	logger.debug("PUT:")

	data = request.body.readline()
	if not data:
		HTTPError(400, "No data received")

	data = json.loads(data)
	
	#Create a good ID
	_id = 'view.'+ str(account.user) + '.' + str(data['name'])
	
	#Creating the crecord for the view
	my_record = crecord({'_id': _id },type='view', name=data['name'])
	my_record.data['items'] = []
	
	#my_record.data['hunit'] = 300
	my_record.data['column'] = data['column']
	####################################
	
	#Cleaning extjs output and put the record in base
	w = data['items']
	logger.debug('creating view : cleaning extjs output')
	#logger.debug('##############################################################');
	#logger.debug(w)
	#logger.debug('##############################################################');
	for i in w :
		d = {}
		d['xtype'] = i['xtype']
		d['type'] = i['type']
		d['refreshInterval'] = i['refreshInterval']
		d['nodeId'] = i['nodeId']
		d['title'] = i['title']
		d['colspan'] = i['colspan']
		d['rowspan'] = i['rowspan']
		my_record.data['items'].append(d)
		
	#logger.debug('------dump the end output---------')	
	#logger.debug(my_record)
	#logger.debug('---------------------end dump dict-------------------')
	
	try:
		storage.put(my_record, account=account)
		logger.debug('creating view : New view added to database')
	except:
		logger.debug('creating view : Adding view in database have FAILED !')
	
	#logger.debug(str(data))
	
	return

###PUT
@put('/ui/views/:_id',apply=[check_auth])
def ui_views_put(_id):
	#extjs try to give another index to the node, so bottle do nothing, views arn't node
	logger.debug('PUT request intercept, do nothing (views aren\'t a real tree')
	return

#### DELETE
@delete('/ui/views/:_id',apply=[check_auth])
def ui_views_delete(_id):
	account = get_account()
	storage = get_storage(namespace='object')

	logger.debug("DELETE:")
	logger.debug(" + _id: "+str(_id))
	try:
		storage.remove(_id, account=account)
	except:
		HTTPError(404, _id+" Not Found")




#### GET
@get('/ui/view')
def get_all_menu():
	return



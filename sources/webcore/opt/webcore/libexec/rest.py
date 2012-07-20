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

import sys, os, logging, json

import bottle
from bottle import route, get, put, delete, request, HTTPError, post

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord

#import protection function
from libexec.auth import check_auth, get_account ,check_group_rights

logger = logging.getLogger("rest")

ctype_to_group_access = {
							'schedule' : 'group.CPS_schedule_admin',
							'curve' : 'CPS_curve_admin',
							'account' : 'CPS_account_admin',
							'group' : 'CPS_account_admin'
						}

#########################################################################

#### GET
@get('/rest/:namespace/:ctype/:_id',	apply=[check_auth])
@get('/rest/:namespace/:ctype',		apply=[check_auth])
@get('/rest/:namespace',		apply=[check_auth])
def rest_get(namespace, ctype=None, _id=None):
	
	#get the session (security)
	account = get_account()

	limit		= int(request.params.get('limit', default=20))
	page		= int(request.params.get('page', default=0))
	start		= int(request.params.get('start', default=0))
	groups		= request.params.get('groups', default=None)
	search		= request.params.get('search', default=None)
	filter		= request.params.get('filter', default=None)
	sort		= request.params.get('sort', default=None)
	query		= request.params.get('query', default=None)
	onlyWritable	= request.params.get('onlyWritable', default=False)
	ids			= request.params.get('ids', default=[])
	
	get_id			= request.params.get('_id', default=None)
	
	if not _id and get_id:
		_id  = get_id
	
	if not isinstance(ids, list):
		try:
			ids = json.loads(ids)
		except Exception, err:
			logger.error("Impossible to decode ids: %s: %s" % (ids, err))

	if filter:
		try:
			filter = json.loads(filter)
		except Exception, err:
			logger.error("Impossible to decode filter: %s: %s" % (filter, err))
			filter = None
			

	msort = []
	if sort:
		#[{"property":"timestamp","direction":"DESC"}]
		sort = json.loads(sort)
		for item in sort:
			direction = 1
			if str(item['direction']) == "DESC":
				direction = -1

			msort.append((str(item['property']), direction))
		

	logger.debug("GET:")
	logger.debug(" + User: "+str(account.user))
	logger.debug(" + Group(s): "+str(account.groups))
	logger.debug(" + namespace: "+str(namespace))
	logger.debug(" + Ctype: "+str(ctype))
	logger.debug(" + _id: "+str(_id))
	logger.debug(" + ids: "+str(ids))
	logger.debug(" + Limit: "+str(limit))
	logger.debug(" + Page: "+str(page))
	logger.debug(" + Start: "+str(start))
	logger.debug(" + Groups: "+str(groups))
	logger.debug(" + onlyWritable: "+str(onlyWritable))
	logger.debug(" + Sort: "+str(sort))
	logger.debug(" + MSort: "+str(msort))
	logger.debug(" + Search: "+str(search))
	logger.debug(" + filter: "+str(filter))
	logger.debug(" + query: "+str(query))
	
	storage = get_storage(namespace=namespace)
	
	total = 0
	
	mfilter = {}
	if isinstance(filter, list):
		if len(filter) > 0:
			mfilter = filter[0]
		else:
			logger.error(" + Invalid filter format")
			
	elif isinstance(filter, dict):
		mfilter = filter
	
	records = []
	if ctype:
		if mfilter:
			mfilter['crecord_type'] = ctype
		else:
			mfilter = {'crecord_type': ctype}
			
	if query:
		mfilter = {'crecord_name': { '$regex' : '.*'+str(query)+'.*', '$options': 'i' }}


	if _id:
		ids = _id.split(',')
		
	if ids:	
		records = storage.get(ids, account=account)
		
		total = len(records)
		
		if total == 0:
			return HTTPError(404, ids+" Not Found")
						
	else:
		if search:
			mfilter['_id'] = { '$regex' : '.*'+search+'.*', '$options': 'i' }
		
		logger.debug(" + mfilter: "+str(mfilter))
		records =  storage.find(mfilter, sort=msort, limit=limit, offset=start, account=account)
		total =	storage.count(mfilter, account=account)

	output = []
	
	#----------------dump part of record (binaries aren't json encodable)-------
	for record in records:
		if record:
			data = None
			if onlyWritable:
				if record.check_write(account=account):
					data = record.dump(json=True)
			else:
				data = record.dump(json=True)

			if data:
				data['id'] = data['_id']
				if data.has_key('next_run_time'):
					data['next_run_time'] = str(data['next_run_time'])
				output.append(data)

	output={'total': total, 'success': True, 'data': output}

	#logger.debug(" + Output: "+str(output))

	return output
	
#### POST
@post('/rest/:namespace/:ctype/:_id',	apply=[check_auth])
@post('/rest/:namespace/:ctype',	apply=[check_auth])
def rest_post(namespace, ctype, _id=None):
	#get the session (security)
	account = get_account()
	storage = get_storage(namespace=namespace)
	
	#check rights on specific ctype (check ctype_to_group_access variable below)
	if ctype in ctype_to_group_access:
		if not check_group_rights(account,ctype_to_group_access[ctype]):
			return HTTPError(403, 'Insufficient rights')

	logger.debug("POST:")

	data = request.body.readline()
	if not data:
		return HTTPError(400, "No data received")

	logger.debug(" + data: %s" % data)
	logger.debug(" + data-type: %s" % type(data))
		
	if isinstance(data, str):
		try:
			data = json.loads(data)
		except Exception, err:
			logger.error("PUT: Impossible to parse data (%s)" % err)
			return HTTPError(404, "Impossible to parse data")

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
	
	## Set group
	if data.has_key('aaa_group'):
		group = data['aaa_group']
	else:
		group = account.group

	record = None
	if _id:
		try:
			record = storage.get(_id ,account=account)
			logger.debug('Update record %s' % _id)
		except:
			logger.debug('Create record %s' % _id)

	if record:
		for key in dict(data).keys():
			record.data[key] = data[key]
			
		# Update Name	
		try:
			record.name = data['crecord_name']
		except:
			pass
		
	else:
		raw_record = crecord(_id=_id, type=str(ctype)).dump()
		for key in dict(data).keys():
			raw_record[key] = data[key]

		record = crecord(raw_record=raw_record)
		record.chown(account.user)
		record.chgrp(group)
	
	logger.debug(' + Record: %s' % record.dump())
	try:
		storage.put(record, namespace=namespace, account=account)
		
	except Exception, err:
		logger.error('Impossible to put (%s)' % err)
		return HTTPError(403, "Access denied")
		
#### PUT
@put('/rest/:namespace/:ctype/:_id',	apply=[check_auth])
@put('/rest/:namespace/:ctype',	apply=[check_auth])
def rest_put(namespace, ctype, _id=None):
	#get the session (security)
	account = get_account()
	storage = get_storage(namespace=namespace)
	
	#check rights on specific ctype (check ctype_to_group_access variable below)
	if ctype in ctype_to_group_access:
		if not check_group_rights(account,ctype_to_group_access[ctype]):
			return HTTPError(403, 'Insufficient rights')

	logger.debug("PUT:")

	data = request.body.readline()
	if not data:
		return HTTPError(400, "No data received")

	logger.debug(" + data: %s" % data)
	logger.debug(" + data-type: %s" % type(data))
		
	if isinstance(data, str):
		try:
			data = json.loads(data)
		except Exception, err:
			logger.error("PUT: Impossible to parse data (%s)" % err)
			return HTTPError(404, "Impossible to parse data")
			
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
	
	try:
		storage.update(_id, data, namespace=namespace, account=account)
		
	except Exception, err:
		logger.error('Impossible to put (%s)' % err)
		return HTTPError(403, "Access denied")


#### DELETE
@delete('/rest/:namespace/:ctype/:_id',	apply=[check_auth])
@delete('/rest/:namespace/:ctype',	apply=[check_auth])
def rest_delete(namespace, ctype, _id=None):
	account = get_account()
	storage = get_storage(namespace=namespace)

	logger.debug("DELETE:")
	if not _id:
		data = request.body.readline()
		if not data:
			return HTTPError(400, "No data received")
			
		logger.debug(" + data: %s" % data)
		logger.debug(" + data-type: %s" % type(data))
		
		if isinstance(data, str):
			try:
				data = json.loads(data)
			except Exception, err:
				logger.error("DELETE: Impossible to parse data (%s)" % err)
				return HTTPError(404, "Impossible to parse data")

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
		logger.error("DELETE: No '_id' field in header ...")
		return HTTPError(404, "No '_id' field in header ...")


	logger.debug(" + _id: %s" % _id)
	
	try:
		storage.remove(_id, account=account)
	except:
		return HTTPError(404, _id+" Not Found")


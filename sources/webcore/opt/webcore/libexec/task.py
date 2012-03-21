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
from libexec.auth import check_auth, get_account

logger = logging.getLogger("task")

#########################################################################

@get('/task',apply=[check_auth])
def get_tasks():
	limit		= int(request.params.get('limit', default=20))
	#page		= int(request.params.get('page', default=0))
	start		= int(request.params.get('start', default=0))
	
	account = get_account()
	namespace='object'
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	
	search = storage.find({'crecord_type': 'schedule'},limit=limit, offset=start,account=account)
	
	output = []
	total = 0
	
	for schedule in search:
		if isinstance(schedule, crecord):
			output.append(schedule.dump(json=True))
			total += 1
			
	return {'total': total, 'success': True, 'data': output}

@post('/task',apply=[check_auth])
def post_tasks():
	account = get_account()
	namespace = 'object'
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	
	data = request.body.readline()
	data = json.loads(data)
	
	_id = 'schedule.%s' % data['name']
	
	#check if it's an update
	update = False
	try:
		record = storage.get(_id ,account=account)
		logger.debug('Update task %s' % _id)
		update = True
	except:
		logger.debug('Create task %s' % _id)
			
	if update:
		for key in dict(data).keys():
			record.data[key] = data[key]
	else:
		formated_id = 'schedule.%s' % data['name']
		record = crecord({'_id':formated_id}, type='schedule', name=data['name'])
		for key in dict(data).keys():
			record.data[key] = data[key]

		record.chown(account.user)
		record.chgrp(account.group)
		
	try:
		logger.error(record.dump())
		storage.put(record, namespace=namespace, account=account)
		
	except Exception, err:
		logger.error('Impossible to put (%s)' % err)
		return HTTPError(403, "Access denied")

@delete('/task/:_id',apply=[check_auth])
def delete_task(_id=None):
	account = get_account()
	namespace = 'object'
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)

	try:
		storage.remove(_id, account=account)
		logger.debug('task removed')
	except:
		return HTTPError(404, _id+" Not Found")

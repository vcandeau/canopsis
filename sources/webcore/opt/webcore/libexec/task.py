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

from subprocess import Popen

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

	mfilter = {'crecord_type': 'schedule'}

	search = storage.find(mfilter,limit=limit, offset=start,account=account)
	total =	storage.count(mfilter, account=account)
	
	output = []
	
	#-------------------- fetching last existing log-----------------------------
	for schedule in search:
		if isinstance(schedule, crecord):
			#try to fetch last log
			try:
				task_id = 'schedule.%s' % schedule.name
				last_log = storage.find({'crecord_name': task_id},namespace='task_log',sort=[('timestamp', -1)])
				#take the latest
				if len(last_log) != 0:
					last_log = last_log[0]
			except Exception, err:
				logger.error('Error while fetching last log : %s' % err)
			
			#add to schedule list
			if isinstance(last_log, crecord):
				formated_log = {'success': last_log.data['success'],'output':last_log.data['output'],'timestamp':last_log.data['timestamp'],'data':str(last_log.data['data'])}
				schedule.data['log'] = [formated_log]
				
			output.append(schedule.dump(json=True))
			
	return {'total': total, 'success': True, 'data': output}

@post('/task',apply=[check_auth])
def post_tasks():
	account = get_account()
	namespace = 'object'
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	
	data = request.body.readline()
	data = json.loads(data)
	
	#cleaning
	del data['log']
	
	_id = 'schedule.%s' % data['crecord_name']
	
	#check if it's an update
	update = False
	try:
		record = storage.get(_id ,account=account)
		logger.debug('Update task %s' % _id)
		update = True
	except:
		logger.debug('Create task %s' % _id)
	
	#is it a update ?
	if update:
		for key in dict(data).keys():
			record.data[key] = data[key]
	else:
		formated_id = 'schedule.%s' % data['crecord_name']
		sup_args = {'periodic_task_id': formated_id}
		record = crecord({'_id':formated_id,'name':data['crecord_name']}, type='schedule', name=data['crecord_name'])
		for key in dict(data).keys():
			record.data[key] = data[key]
			
		record.data['kwargs'] = sup_args

		record.chown(account.user)
		record.chgrp(account.group)
		
	try:
		storage.put(record, namespace=namespace, account=account)
		
	except Exception, err:
		logger.error('Impossible to put (%s)' % err)
		return HTTPError(403, "Access denied")

	try:
		output = Popen('service celeryd restart', shell=True)
	except:
		logger.error('Unable to reload celeryd')
	
	

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

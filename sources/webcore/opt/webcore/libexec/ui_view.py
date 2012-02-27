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

logger = logging.getLogger("ui_view")
logger.setLevel(3)
#########################################################################
@get('/ui/dashboard', apply=[check_auth])
def get_dashboard():
	namespace = 'object'
	
	#get the session (security)
	account = get_account()

	storage = get_storage(namespace=namespace, logging_level=logging.DEBUG)

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

'''
@get('/ui/view',	apply=[check_auth])
def tree_get():
	namespace = 'object'
	account = get_account()
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	node = request.params.get('node', default= None)
	
	output = []
	total = 0
		
	if node:
		if node == 'root':
			node = 'directory.root.dir1'
			parentNode = storage.get(node, account=account)
			output = parentNode.dump(json=True)
			output['id'] = output['_id']
			total += 1
		else:	
			parentNode = storage.get(node, account=account)
			logger.debug(str(parentNode.dump()))
			if parentNode:
				records = storage.get_record_childs(parentNode,account=account)
				for record in records:
					data = record.dump(json=True)
					data['id'] = data['_id']
					output.append(data)
					total += 1

	return {"total": total, "success": True, "data": output}
'''

@get('/ui/view',	apply=[check_auth])
def tree_get():
	namespace = 'object'
	account = get_account()
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	node = request.params.get('node', default= None)
	
	output = []
	total = 0
		
	if node:
		if node == 'root':
			parentNode = storage.get('directory.root.dir1', account=account)
			storage.recursive_get(parentNode,account=account)
			output = parentNode.recursive_dump(json=True)
			
	#return {"success": True, "data": {"text":".","children":[output]}}
	return {"text":".","children":[output]}
			
			
			
			
			

@delete('/ui/view/:name',apply=[check_auth])
def tree_delete(name=None):
	logger.debug(str(name))
	
@put('/ui/view/:name',apply=[check_auth])
def tree_update(name='None'):
	namespace = 'object'
	account = get_account()
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	data = json.loads(request.body.readline())

	record_child = storage.get(data['id'], account=account)
	record_parent = storage.get(data['parentId'], account=account)
	
	#if parents are really different
	if(record_child.parent[0] != data['parentId']):
		parent = storage.get(record_child.parent, account=account)

		if isinstance(parent, crecord):
			parent.remove_children(record_child)
			if storage.is_parent(parent,record_child):
				raise ValueError("parent/children link don't remove")
			storage.put([parent])
		
		record_parent.add_children(record_child)
		storage.put([record_child,record_parent])
		
	else : 
		logger.debug('same parent, nothing to do')
	


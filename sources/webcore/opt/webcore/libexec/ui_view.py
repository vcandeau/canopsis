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

logger = logging.getLogger("test_tree")
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
@get('/tree',	apply=[check_auth])
def tree_get():
	
	node = request.params.get('node', default="")
	logger.debug(str(node))
	
	array = []
	
	#child_array.append({"text":"firstLeaf","leaf":"true"})
	#child_array.append({"text":"firstDir","leaf":"false"})
	#child_array.append({"text":"secondLeaf","leaf":"true"})
	
	if(node == "root"):
		array = {"id":"myRoot","text":"myRoot","expanded":"true" }
		
	if(node == "myRoot"):
		array = [{"id":"childDir","text":"childDir"},
		{"id":"anotherDir","text":"anotherDir"}]
		
	if(node == "childDir"):
		array = [{"id":"firstLeaf","text":"firstLeaf","leaf":"true"},
		 {"id":"secondLeaf","text":"secondLeaf","leaf":"true"}]
		
	if(node == "anotherDir"):
		array = [{"id":"ichiLeaf","text":"ichiLeaf","leaf":"true"},
		{"id":"niLeaf","text":"niLeaf","leaf":"true"}]
	
	output = {"total": 1, "success": True, "data": array}
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
	#mfilter = {'crecord_type': 'view_directory'}
		
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
	

@delete('/ui/view/:name',apply=[check_auth])
def tree_delete(name=None):
	logger.debug(str(name))
	
@put('/ui/view/:name',apply=[check_auth])
def tree_update(name='None'):
	logger.debug(str(name))
	data = json.loads(request.body.readline())
	logger.debug(type(data))
	logger.debug(str(data))

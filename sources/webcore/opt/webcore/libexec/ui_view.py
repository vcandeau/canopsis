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
from libexec.auth import check_auth, get_account, check_group_rights

logger = logging.getLogger("ui_view")

#group who have right to access 
group_managing_access = 'group.CPS_view_admin'

#########################################################################
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

@get('/ui/view',apply=[check_auth])
def tree_get():
	namespace = 'object'
	account = get_account()
		
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	
	node = request.params.get('node', default= None)
	
	output = []
	total = 0
		
	if node:
		parentNode = storage.get('directory.root', account=account)
		storage.recursive_get(parentNode,account=account)
		output = parentNode.recursive_dump(json=True)
			
	#return {"success": True, "data": {"text":".","children":[output]}}
	#return {"text":".","children":[output]}
	return output


@delete('/ui/view/:name',apply=[check_auth])
def tree_delete(name=None):
	namespace='object'
	account = get_account()
	storage = get_storage(namespace=namespace, account=account, logging_level=logging.DEBUG)
	
	record = storage.get(name, account=account)
	
	if isinstance(record, crecord):
		if len(record.children) == 0:
			if record.check_write(account=account):
				#remove record from its parent child list
				for parent in record.parent:
					parent_rec = storage.get(parent, account=account)
					parent_rec.remove_children(record )
					if parent_rec.check_write(account=account):
						storage.put(parent_rec,account=account)
					else:
						logger.debug('Access Denied')
						return HTTPError(403, "Access Denied")
			
				try:
					storage.remove(record, account=account)
				except Exception, err:
					logger.error(err)
					return HTTPError(404, 'Error while removing: %s' % err)
			else:
				logger.debug('Access Denied')
				return HTTPError(403, "Access Denied")
				
		else:
			logger.warning('This record have children, remove those child before')

	
	
	
@put('/ui/view/:name',apply=[check_auth])
def tree_update(name='None'):
	namespace = 'object'
	account = get_account()
		
	storage = get_storage(namespace=namespace, account=account)
	
	data = json.loads(request.body.readline())

	try:
		record_parent = storage.get(data['parentId'], account=account)
	except:
		return HTTPError(403, "You don't have right on the parent record")
	
	try:
		logger.debug('try to get the children record')
		record_child = storage.get(data['_id'], account=account)
	except:
		logger.debug('record_child not found')
		record_child = None

	#test if the record exist
	if isinstance(record_child, crecord):
		#check write rights
		if record_parent.check_write(account=account) and record_child.check_write(account=account):
			#if parents are really different
			if(record_child.parent[0] != data['parentId']):
				parent = storage.get(record_child.parent, account=account)

				if isinstance(parent, crecord):
					parent.remove_children(record_child)
					if storage.is_parent(parent,record_child):
						raise ValueError("parent/children link don't remove")
					storage.put([parent],account=account)
				
				logger.debug('updating records')
				record_parent.add_children(record_child)
				storage.put([record_child,record_parent],account=account)
				
			elif (record_child.name != data['crecord_name']): 
				logger.debug('different crecord_name, update name')
				logger.debug('old name : %s' % str(record_child.name))
				logger.debug('new name : %s' % data['crecord_name'])
				record_child.name = data['crecord_name']
				storage.put(record_child,account=account)
			
			else :
				logger.debug('records are the same, nothing to do')
		else:
			logger.debug('Access Denied')
			return HTTPError(403, "Access Denied")
			
	else:
		#add new view/folder
		parentNode = storage.get(data['parentId'], account=account)
		#test rights
		if isinstance(parentNode, crecord):
			if parentNode.check_write(account=account):
				if data['leaf'] == True:
					logger.debug('record is a leaf, add the new view')
					record = crecord({'leaf':True,'_id':data['id'],'items':data['items']},type='view',name=data['crecord_name'],account=account)
				else:
					logger.debug('record is a directory, add it')
					record = crecord({'_id':data['id']},type='view_directory',name=data['crecord_name'],account=account)
				
				parentNode.add_children(record)
				
				record.chown(account._id)
				record.chgrp(group_managing_access)
				record.chmod('g+w')
				record.chmod('g+r')
				
				storage.put([record,parentNode],account=account)
			else:
				logger.debug('Access Denied')
				return HTTPError(403, "Access Denied")

		else :
			logger.error('ParentNode doesn\'t exist')

@get('/ui/view/exist/:name',apply=[check_auth])
def check_exist(name=None):
	namespace = 'object'
	account = get_account()
	storage = get_storage(namespace=namespace, account=account)
	
	mfilter = {'crecord_name':name}
	
	try:
		logger.debug('try to get view')
		record_child = storage.find_one(mfilter=mfilter, account=account)
		if record_child:
			return {"total": 1, "success": True, "data": {'exist' : True}}
		else:
			return {"total": 0, "success": True, "data": {'exist' : False}}
	except Exception,err:
		logger.error('Error while fetching view : %s' % err)
		return {"total": 0, "success": False, "data": {}}

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
from bottle import route, get, put, delete, request, HTTPError, post, response

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord
try:
	from cgroup import cgroup
except:
	pass

#import protection function
from libexec.auth import check_auth, get_account

logger = logging.getLogger('Account')

#########################################################################

#### GET Me
@get('/account/me',apply=[check_auth])
def account_get_me():
	namespace = 'object'
	ctype= 'account'
	
	#get the session (security)
	account = get_account()

	storage = get_storage(namespace=namespace)

	#try:
	logger.debug(" + Try to get '%s' ... " % account._id)
	record = storage.get(account._id, account=account)

	logger.debug("   + Result: '%s'" % record)
	#except Exception, err:
	#	self.logger.error("Exception !\nReason: %s" % err)
	#	return HTTPError(404, _id+" Not Found")

	if record:
		data = record.dump(json=True)
		data['id'] = data['_id']
		output = [data]

	output={'total': 1, 'success': True, 'data': output}

	logger.debug(" + Output: "+str(output))
	
	logger.debug('Response status: %s' % response.status)
	
	return output

#### POST setConfig
@post('/account/setConfig/:_id',apply=[check_auth])
def account_setConfig(_id):
	account = get_account()
	storage = get_storage(namespace='object')
	
	value = request.params.get('value', default=None)
	
	logger.debug(" + setConfig '%s' => '%s'" % (_id, value))
	
	if value:
		account.data[_id] = value
		storage.put(account, account=account)
		output={'total': 0, 'success': True, 'data': []}
	else:
		output={'total': 0, 'success': False, 'data': []}
	
	return output

@get('/account/getAuthKey/:dest_account',apply=[check_auth])
def account_getAuthKey(dest_account):
	if not dest_account:
		return HTTPError(404, 'No account specified')
	
	#------------------------get accounts----------------------
	account = get_account()
	storage = get_storage(namespace='object',account=account)
	
	_id = 'account.%s' % dest_account
	
	try:
		aim_account = caccount(storage.get(_id,account=account))
		
		return {'total':1,'success':True,'data':{'authkey':aim_account.get_authkey()}}
	except Exception,err:
		logger.debug('Error while fetching account : %s' % err)
		return {'total':0,'success':False,'data':{'output':str(err)}}
		
	

@get('/account/getNewAuthKey/:dest_account',apply=[check_auth])
def account_newAuthKey(dest_account):
	if not dest_account:
		return HTTPError(404, 'No account specified')
	
	#------------------------get accounts----------------------
	account = get_account()
	storage = get_storage(namespace='object',account=account)
	
	_id = 'account.%s' % dest_account
	
	try:
		aim_account = caccount(storage.get(_id,account=account))
	except:
		logger.debug('aimed account not found')
		return HTTPError(404, 'Wrong account name or no enough rights')
	
	#---------------------generate new key-------------------
	logger.debug('Change AuthKey for : %s' % aim_account.user)
	
	try:
		aim_account.generate_new_authkey()
		storage.put(aim_account)
		logger.debug('New auth key is : %s' % aim_account.get_authkey())
		return {'total': 0, 'success': True, 'data': {'authkey': aim_account.get_authkey(),'account':aim_account.user}}
	except Exception,err:
		logger.error('Error while updating auth key : %s' % err)
		return {'total': 0, 'success': False, 'data': {}}
	
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

	total = 0
	mfilter = {}
	if ctype:
		mfilter = {'crecord_type': ctype}
	if _id:	
		try:
			records = [ storage.get(_id, account=account) ]
			total = 1
		except Exception, err:
			self.logger.error("Exception !\nReason: %s" % err)
			return HTTPError(404, _id+" Not Found")
		
	else:
		records =  storage.find(mfilter, limit=limit, offset=start, account=account)
		total =	   storage.count(mfilter, account=account)

	output = []
	for record in records:
		if record:
			data = record.dump(json=True)
			data['id'] = data['_id']
			output.append(data)

	output={'total': total, 'success': True, 'data': output}

	#logger.debug(" + Output: "+str(output))

	return output

	
#### POST
@post('/account/', apply=[check_auth])
def account_post():
	#get the session (security)
	account = get_account()
	root_account = caccount(user="root", group="root")
	
	storage = get_storage(namespace='object')

	logger.debug("POST:")

	data = request.body.readline()
	if not data:
		return HTTPError(400, "No data received")

	data = json.loads(data)

	## Clean data
	try:
		del data['_id']
	except:
		pass

	try:
		del data['id']
	except:
		pass

	try:
		del data['crecord_type']
	except:
		pass
	
	if data['user']:
		_id = "account." + str(data['user'])

		update = False
		try:
			record = storage.get(_id ,account=account)
			logger.debug('Update account %s' % _id)
			update = True
		except:
			logger.debug('Create account %s' % _id)

		if update:
			if data['passwd'] is not None:
				passwd = str(data['passwd'])
			else:
				passwd = None
				
			group = str(data['groups'])

			del data['passwd']
			del data['groups']

			for key in dict(data).keys():
				record.data[key] = data[key]

			update_account = caccount(record)			
			if passwd:
				logger.error(' + Update password ...')
				update_account.passwd(passwd)
			if group:
				logger.debug(' + Update group ...')
				logger.debug(group)
				logger.debug(type(group))
				update_account.chgrp(group)

			storage.put(update_account, account=account)

		else:
			logger.debug(' + New account')
			new_account = caccount(user=data['user'], group=data['groups'], lastname=data['lastname'], firstname=data['firstname'], mail=data['mail'])

			
			passwd = data['passwd']
			new_account.passwd(passwd)
			logger.debug("   + Passwd: '%s'" % passwd)

			#del data['user']
			#del data['aaa_group']
			#del data['lastname']
			#del data['firstname']
			#del data['mail']

			#logger.debug(' + Set data ...')
			#for key in dict(data).keys():
			#	logger.debug("   - '%s': '%s'" % (key, data[key]))
			#	new_account.data[key] = data[key]

			logger.debug(' + Save new account')
			storage.put(new_account, account=account)
			
			logger.debug(' + Create view directory')
			
			rootdir = storage.get('directory.root', account=root_account)
			if rootdir:
				userdir = crecord({'_id': 'directory.root.%s' % new_account.user,'id': 'directory.root.%s' % new_account.user ,'expanded':'true'}, type='view_directory', name=new_account.user)
				userdir.chown(new_account.user)
				userdir.chgrp(new_account.group)
				userdir.chmod('g-w')
				userdir.chmod('g-r')
				storage.put(userdir, account=account)
				rootdir.add_children(userdir)

				storage.put(rootdir, account=root_account)
				storage.put(userdir, account=account)
			else:
				logger.error('Imposible to get rootdir')

	else:
		logger.warning('WARNING : no user specified ...')


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
		return HTTPError(404, _id+" Not Found")

### GROUP
@post('/account/addToGroup/:group_id/:account_id',apply=[check_auth])
def add_account_to_group(group_id=None,account_id=None):
	if not group_id or not account_id:
		return HTTPError(400, 'Bad request, must specified group and account')
	
	session_account = get_account()
	storage = get_storage(namespace='object',account=session_account)
	
	#get group && account
	if group_id.find('group.') == -1:
		group_id = 'group.%s' % group_id
		
	if account_id.find('account.') == -1:
		account_id = 'account.%s' % account_id
		
	logger.debug('Try to get %s and %s' % (account_id,group_id))
		
	try:
		account_record = storage.get(account_id,account=session_account)
		account = caccount(account_record)
		group_record = storage.get(group_id,account=session_account)
		group = cgroup(group_record)
		
	except Exception,err:
		logger.error('error while fetching %s and %s : %s' % (account_id,group_id,err))
		return HTTPError(403, 'Record not found or insufficient rights')
		
	#put in group
	group.add_accounts(account)
	
	try:
		storage.put([group,account])
	except:
		logger.error('Put group/account in db goes wrong')
		return HTTPError(500, 'Put group/account in db goes wrong')
	
	return {'total' :1, 'success' : True, 'data':[]}
		
@post('/account/removeFromGroup/:group_id/:account_id',apply=[check_auth])
def remove_account_from_group(group_id=None,account_id=None):
	if not group_id or not account_id:
		return HTTPError(400, 'Bad request, must specified group and account')
	
	session_account = get_account()
	storage = get_storage(namespace='object',account=session_account)
	
	#get group && account
	if group_id.find('group.') == -1:
		group_id = 'group.%s' % group_id
		
	if account_id.find('account.') == -1:
		account_id = 'account.%s' % account_id
		
	logger.debug('Try to get %s and %s' % (account_id,group_id))
		
	try:
		account_record = storage.get(account_id,account=session_account)
		account = caccount(account_record)
		group_record = storage.get(group_id,account=session_account)
		group = cgroup(group_record)
		
	except Exception,err:
		logger.error('error while fetching %s and %s : %s' % (account_id,group_id,err))
		return HTTPError(403, 'Record not found or insufficient rights')
		
	#remove in group
	group.remove_accounts(account)
	
	try:
		storage.put([group,account])
	except:
		logger.error('Put group/account in db goes wrong')
		return HTTPError(500, 'Put group/account in db goes wrong')
	
	return {'total' :1, 'success' : True, 'data':[]}
		
		

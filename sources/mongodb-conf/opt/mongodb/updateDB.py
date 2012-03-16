#!/usr/bin/env python
#--------------------------------
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

from caccount import caccount
from cstorage import cstorage
from cselector import cselector
from crecord import crecord
from cconfig import cconfig

import time

##set root account
account1 = caccount(user="root", group="root")

##get storage
storage = cstorage(account=account1, namespace='object')

#remove old view manager
storage.remove('view.config_editor',account=account1)

## add view manager
try:
	record_in_db = storage.get('view.view_manager')
except:
	record1 = crecord({'_id': 'view.view_manager' }, type='view', name='Views')
	record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'ViewTreePanel'},'id': 'widget-views'} ]
	record1.chmod('o+r')
	storage.put(record1)
	
##############################update administration views##################################
record1 = crecord({'_id': 'view._default_.dashboard' }, type='view', name='Dashboard')
record1.chmod('o+r')
record1.data['rowHeight'] =  300
record1.data['items'] = [{'position':{'width': 1,'top': 0, 'left': 0, 'height': 1},'data':{'xtype': 'text', 'text': 'Welcome to Canopsis !', 'name': 'Text Cell'},'id': 'widget-dashboard'}]
storage.put(record1)

record1 = crecord({'_id': 'view.components' }, type='view', name='Components')
record1.chmod('o+r')
record1.data['items'] = [ { 'position': {'width': 1,'top': 0, 'left': 0, 'height': 1},'data':{'xtype': 'list', 'filter': '{"source_type":"component"}', 'show_resource': False},'id':'widget-components'} ]
storage.put(record1)

record1 = crecord({'_id': 'view.resources' }, type='view', name='Resources')
record1.chmod('o+r')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1},'data':{ 'xtype': 'list', 'filter': '{"source_type":"resource"}'},'id': 'widget-resources'} ]
storage.put(record1)

### Account
record1 = crecord({'_id': 'view.account_manager' }, type='view', name='Accounts')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'AccountGrid'},'id': 'widget-accounts'} ]
storage.put(record1)

### Group
record1 = crecord({'_id': 'view.group_manager' }, type='view', name='Groups')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'GroupGrid'},'id': 'widget-group-manager'} ]
storage.put(record1)

############################################################################################


## add root directory
try:
	record_in_db = storage.get('directory.root')
except:
	rootdir = crecord({'_id': 'directory.root','id': 'directory.root','expanded':'true'},type='view_directory', name="root directory")
	rootdir.chmod('o+r')
	storage.put(rootdir)

##find all account and create root dir for them
account_list = storage.find({'crecord_type':'account'}, account=account1)
accounts_names = []

#for each account
for record in account_list:
	account = caccount(record)
	user = account.name
	print('|--- update %s views ---|' % user)
	#test if user root dir existe, then if not -> add directory view
	try :
		record_in_db = storage.get('directory.root.%s' % user)
	except:
		record_in_db = None
		
	if record_in_db is None:
		userdir = crecord({'_id': 'directory.root.%s' % user,'id': 'directory.root.%s' % user ,'expanded':'true'}, type='view_directory', name=user)
		userdir.chown(user)
		userdir.chgrp(user)
		userdir.chmod('g-w')
		userdir.chmod('g-r')

		storage.put(userdir)
		rootdir.add_children(userdir)

		storage.put(rootdir)
		storage.put(userdir)
		
		#search all user view and add them to root directory
		views = storage.find({'crecord_type':'view'}, account=account)
		for view in views:
			#if this account is the owner of the view
			if view.owner == user:
				#if view is not in administration views
				if view._id not in ['view._default_.dashboard','view.ComponentDetails','view.components','view.resources','view.group_manager','view.account_manager','view.view_manager']:
					if not view.parent:
						print(view.dump()['crecord_name'])
						view.data['items'] = []
						view.data['leaf'] = True
						userdir.add_children(view)
						storage.put(view)
		storage.put(userdir)

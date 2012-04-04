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

import logging
import time

#namespaces = ['cache', 'events', 'events_log', 'object', 'perfdata', 'perfdata.fs.files', 'perfdata.fs.chunks']
namespaces = ['cache', 'object']

## Create accounts and groups
group1 = crecord({'_id': 'group.root' }, type='group', name='root')
group1.chmod('o+r')
group2 = crecord({'_id': 'group.canopsis' }, type='group', name='canopsis')
group2.chmod('o+r')

account1 = caccount(user="root", group="root")
account1.firstname = "Call-me"
account1.lastname = "God"
account1.passwd("root")

account2 = caccount(user="canopsis", group="canopsis")
account2.firstname = "Cano"
account2.lastname = "Psis"
account2.passwd("canopsis")

## Create storage
storage = cstorage(account1, namespace='object', logging_level=logging.DEBUG)
for namespace in namespaces:
	storage.drop_namespace(namespace)

## Create 100MB cache
storage.db.create_collection('cache', options={'capped': True, 'size': 104857600})

## Save accounts and groups
storage.put([account1, account2])
storage.put([group1, group2])

## View

### Default Dasboard
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

#record1 = crecord({'_id': 'view.ComponentDetails' }, type='view', name='Component Details')
#record1.chmod('o+r')
#record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{'xtype': 'states'},'id': 'widget-states'} ]
#record1.data['template'] = True
#storage.put(record1)

###Root directory
rootdir = crecord({'_id': 'directory.root','id': 'directory.root','expanded':'true'},type='view_directory', name="root directory")
rootdir.chmod('o+r')
storage.put(rootdir)

for user in [ 'canopsis', 'root' ]:
	userdir = crecord({'_id': 'directory.root.%s' % user,'id': 'directory.root.%s' % user ,'expanded':'true'}, type='view_directory', name=user)
	userdir.chown(user)
	userdir.chgrp(user)
	userdir.chmod('g-w')
	userdir.chmod('g-r')

	storage.put(userdir)
	rootdir.add_children(userdir)

	storage.put(rootdir)
	storage.put(userdir)
	

###test views
'''
record1 = crecord({'_id': 'directory.root.dir1','id': 'directory.root.dir1','expanded':'true'},type='view_directory', name="root directory")
record4 = crecord({'_id': 'directory.root.dir2','id': 'directory.root.dir2'},type='view_directory', name="second directory")
record6 = crecord({'_id': 'directory.root.dir3','id': 'directory.root.dir3'},type='view_directory', name="third directory")
record8 = crecord({'_id': 'directory.root.dir8','id': 'directory.root.dir8'},type='view_directory', name="eight directory")
record2 = crecord({'_id': 'view.root.one','leaf': True,'id': 'view.root.one'},type='view', name="first view")
record3 = crecord({'_id': 'view.root.two','leaf': True,'id': 'view.root.two'},type='view', name="second view")
record5 = crecord({'_id': 'view.root.three','leaf': True,'id': 'view.root.three'},type='view', name="third view")
record7 = crecord({'_id': 'view.root.seven','leaf': True,'id': 'view.root.seven'},type='view', name="seven view")

storage.put([record1, record2, record3, record4,record5,record6,record7,record8])

record1.add_children(record4)
record1.add_children(record2)
record1.add_children(record6)
record1.add_children(record7)

record4.add_children(record3)
record4.add_children(record5)
record4.add_children(record8)

storage.put([record1, record2, record3, record4,record5,record6,record7,record8])
'''
### Account
record1 = crecord({'_id': 'view.account_manager' }, type='view', name='Accounts')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'AccountGrid'},'id': 'widget-accounts'} ]
storage.put(record1)

### Group
record1 = crecord({'_id': 'view.group_manager' }, type='view', name='Groups')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'GroupGrid'},'id': 'widget-group-manager'} ]
storage.put(record1)

### View
record1 = crecord({'_id': 'view.view_manager' }, type='view', name='Views')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'ViewTreePanel'},'id': 'widget-views'} ]
record1.chmod('o+r')
storage.put(record1)

###task
record1 = crecord({'_id': 'view.task_manager' }, type='view', name='Tasks')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'TaskGrid'},'id': 'widget-task-manager'} ]
storage.put(record1)

###briefcase
record1 = crecord({'_id': 'view.briefcase' }, type='view', name='Briefcase')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'BriefcaseGrid'},'id': 'widget-briefcase'} ]
storage.put(record1)

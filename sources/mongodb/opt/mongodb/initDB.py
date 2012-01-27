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

namespaces = ['cache', 'events', 'events_log', 'object', 'perfdata', 'perfdata.fs.files', 'perfdata.fs.chunks']

## Create accounts and groups
group1 = crecord({'_id': 'group.root' }, type='group', name='root')
group2 = crecord({'_id': 'group.canopsis' }, type='group', name='canopsis')

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
record1.data['items'] = [{'xtype': 'text', 'text': 'Welcome to Canopsis !', 'name': 'Text Cell'}]
storage.put(record1)

record1 = crecord({'_id': 'view.components' }, type='view', name='Components')
record1.chmod('o+r')
record1.data['items'] = [ { 'xtype': 'list', 'filter': '{"source_type":"component"}', 'show_resource': False} ]
storage.put(record1)

record1 = crecord({'_id': 'view.resources' }, type='view', name='Resources')
record1.chmod('o+r')
record1.data['items'] = [ { 'xtype': 'list', 'filter': '{"source_type":"resource"}'} ]
storage.put(record1)

record1 = crecord({'_id': 'view.ComponentDetails' }, type='view', name='Component Details')
record1.chmod('o+r')
record1.data['items'] = [ { 'xtype': 'states'} ]
record1.data['template'] = True
storage.put(record1)

### Account
record1 = crecord({'_id': 'view.account_manager' }, type='view', name='Accounts')
record1.data['items'] = [ { 'xtype': 'AccountGrid'} ]
storage.put(record1)

### Group
record1 = crecord({'_id': 'view.group_manager' }, type='view', name='Groups')
record1.data['items'] = [ { 'xtype': 'GroupGrid'} ]
storage.put(record1)

### Views
record1 = crecord({'_id': 'view.config_editor' }, type='view', name='Views')
record1.data['items'] = [ { 'xtype': 'ViewEditor'} ]
record1.chmod('o+r')
storage.put(record1)

## Menu
record1 = crecord({'_id': 'menu.view', 'expanded': True, 'leaf': False }, type='menu', name='View')
record1.chmod('o+r')

record2 = crecord({'expanded': True, 'leaf': False }, type='menu', name='Configuration')
record2.chmod('o+r')
record21 = crecord({'leaf': True, 'view': 'view.config_editor'}, type='menu', name='Views')
record21.chmod('o+r')

record3 = crecord({'expanded': True, 'leaf': False }, type='menu', name='Administration')
record31 = crecord({'leaf': True, 'view': 'view.account_manager' }, type='menu', name='Accounts')
record32 = crecord({'leaf': True, 'view': 'view.group_manager' }, type='menu', name='Groups')

storage.put([record1, record2, record3])
storage.put([record21, record31, record32])

record2.add_children(record21)

record3.add_children(record31)
record3.add_children(record32)

storage.put([record1, record2, record3])
storage.put([record21, record31, record32])

## Configuration

config = cconfig(name="amqp", storage=storage)
config.setstring("host", "localhost")
config.setint("port", 5672)
config.setstring("userid", "guest")
config.setstring("password", "guest")
config.setstring("virtual_host", "canopsis")
config.setstring("exchange_name", "canopsis")
config.save()

config = cconfig(name="amqp2websocket", storage=storage)
config.setint("port", 8090)
config.setbool("debug", False)
config.setstring("interface", "0.0.0.0")
config.setint("max_clients", 20)
config.save()

config = cconfig(name="webserver", storage=storage)
config.setint("port", 8082)
config.setbool("debug", False)
config.setstring("interface", "0.0.0.0")
config.save()

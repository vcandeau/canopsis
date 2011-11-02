#!/usr/bin/env python

from caccount import caccount
from cstorage import cstorage
from cselector import cselector
from crecord import crecord
from csla import csla
from cbrule import cbrule
from cconfig import cconfig

import logging
import time

namespaces = ['cache', 'inventory', 'history', 'sla', 'object', 'perfdata.fs.files', 'perfdata.fs.chunks']

## Create root account
account1 = caccount(user="root", group="root")
account1.firstname = "Call-me"
account1.lastname = "God"
account1.passwd("root")

account2 = caccount(user="canopsis", group="canopsis")
account2.firstname = "Canop"
account2.lastname = "Psis"
account2.passwd("canopsis")

## Create storage
storage = cstorage(account1, namespace='object', logging_level=logging.DEBUG)
for namespace in namespaces:
	storage.drop_namespace(namespace)

## Create 100MB cache
storage.db.create_collection('cache', options={'capped': True, 'size': 104857600})

## Save account
storage.put([account1, account2])

## View

### Default Dasboard
record1 = crecord({'_id': 'view._default_.dashboard' }, type='view', name='Dashboard')
record1.chmod('o+r')
record1.data['items'] = [ { 'xtype': 'panel', 'html': 'Welcome to Canopsis !'} ]
storage.put(record1)

### Account
record1 = crecord({'_id': 'view.account_manager' }, type='view', name='Accounts')
record1.data['items'] = [ { 'xtype': 'AccountGrid'} ]
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


storage.put([record1, record2, record3])
storage.put([record21, record31])

record2.add_children(record21)

record3.add_children(record31)

storage.put([record1, record2, record3])
storage.put([record21, record31])

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

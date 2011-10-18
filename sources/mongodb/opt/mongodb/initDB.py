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
account1.passwd("root")
account2 = caccount(user="canopsis", group="canopsis")
account2.passwd("canopsis")

## Create storage
storage = cstorage(account1, namespace='object', logging_level=logging.DEBUG)
for namespace in namespaces:
	storage.drop_namespace(namespace)

## Create 100MB cache
storage.db.create_collection('cache', options={'capped': True, 'size': 104857600})

## Save account
storage.put([account1, account2])

## Menu
record1 = crecord({'expanded': True, 'leaf': False }, type='menu', name='View')
record1.chmod('o+r')

record2 = crecord({'leaf': True, 'view': 'view.my_view' }, type='menu', name='Host')
record2.chmod('o+r')

record3 = crecord({'leaf': True, 'view': 'view.my_view2' }, type='menu', name='Service')
record3.chmod('o+r')

record4 = crecord({'expanded': True, 'leaf': False }, type='menu', name='Configuration')
record5 = crecord({'leaf': True }, type='menu', name='Selector')
record6 = crecord({'leaf': True }, type='menu', name='SLA')

storage.put([record1, record2, record3, record4, record5, record6])

record1.add_children(record2)
record1.add_children(record3)

record4.add_children(record5)
record4.add_children(record6)

storage.put([record1, record2, record3, record4, record5, record6])

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


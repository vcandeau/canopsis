#!/usr/bin/env python

from caccount import caccount
from cstorage import cstorage
from cselector import cselector
from cavailability import cavailability
from crecord import crecord
from csla import csla
from cbrule import cbrule

import logging
import time

storage = cstorage(caccount(user='root', group='root'), namespace='object', logging_level=logging.DEBUG)

## Save Selectors
selector = cselector(name="all-hosts", storage=storage, namespace="inventory")
selector.mfilter = {'source_type': 'host'}
selector.save()

selector = cselector(name="all-services", storage=storage, namespace="inventory")
selector.mfilter = {'source_type': 'service'}
selector.save()

availability = cavailability(name="all-http-services", storage=storage, namespace="inventory")
availability.mfilter = {'source_type': 'service', 'service_description': 'HTTP'}
availability.save()

## Save SLA
sla = csla(name="all-http-services", storage=storage)
sla.mfilter = {'source_type': 'service', 'service_description': 'HTTP'}
sla.set_threshold(98,95)
sla.set_cycle(int(time.time())+120, 360, True)
sla.save()

## View 
record1 = crecord({'_id': 'view.root.test' }, type='view', name='Test')

record1.data['nbColumn'] =  5
record1.data['rowHeight'] =  300
record1.data['nodeId'] =  'canopsis.internal.check.sla.root.all-http-services'
record1.data['items'] = []

record1.data['items'].append({ 'colspan': 5, 'xtype': 'highcharts', 'type': 'line', 'refreshInterval': 60, 'title': 'SLA - HTTP'})

record1.data['items'].append({ 'colspan': 3, 'xtype': 'highcharts', 'type': 'line', 'refreshInterval': 60, 'nodeId': 'nagios.Central.check.service.william.Current Load 8', 'title': 'Load Average' })

record1.data['items'].append({ 'colspan': 1, 'xtype': 'highcharts', 'type': 'pie', 'refreshInterval': 60, 'title': 'SLA - HTTP' })

record1.data['items'].append({ 'colspan': 1, 'xtype': 'kpi', 'refreshInterval': 10, 'title': 'SLA - HTTP', 'type': 'speedometer', 'label': 'ok' })

record1.data['items'].append({ 'colspan': 5, 'xtype': 'highcharts', 'type': 'line', 'refreshInterval': 60, 'nodeId': 'nagios.Central.check.service.william.check Mongo', 'title': 'MongoDB', 'rowHeight': 400 })

storage.put(record1)

## View
record1 = crecord({'_id': 'view.my_view2' }, type='view', name='My View ...')
record1.data['items'] = [{ 'xtype': 'highcharts', 'type': 'line', 'refreshInterval': 60, 'nodeId': 'nagios.Central.check.service.william.Current Load 8', 'title': 'Load Average' }]
storage.put(record1)


## Create Bussiness Rules
myrule1 = cbrule(name='myrule1', autoinit=False, storage=storage, mids=[ 'nagios.Central.check.service.william.HTTP', 'nagios.Central.check.service.william.SSH' ])

crit_binrule = { 'and': [
	{'id|state|nagios.Central.check.service.william.HTTP': 2},
	{'id|state|nagios.Central.check.service.william.SSH': 2},
] }

warn_binrule = { 'or': [
	{'id|state|nagios.Central.check.service.william.HTTP': 2},
	{'id|state|nagios.Central.check.service.william.SSH': 2},
] }

myrule1.add_check('check_binarierule', {'warn_rule': warn_binrule, 'crit_rule': crit_binrule })

myrule1.save()



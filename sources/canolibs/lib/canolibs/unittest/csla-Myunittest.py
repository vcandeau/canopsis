#!/usr/bin/env python

import unittest

from csla import csla

from caccount import caccount
from cstorage import cstorage
from cselector import cselector
from crecord import crecord

import time

STORAGE = None
SELECTOR = None
SLA = None
STATE = 0

def cb_on_ok(mycsla):
	global STATE
	STATE = 0

def cb_on_warn(mycsla):
	global STATE
	STATE = 1

def cb_on_crit(mycsla):
	global STATE
	STATE = 2

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Creation(self):
		global SLA
		SLA = csla(name="mysla", storage=STORAGE, selector=SELECTOR, namespace='unittest')

		SELECTOR.save()
		SLA.save()

	def test_02_Load(self):
		global SLA
		SLA = csla(name="mysla", storage=STORAGE, cb_on_ok=cb_on_ok, cb_on_warn=cb_on_warn, cb_on_crit=cb_on_crit)

	def test_03_calcul_current(self):
		(current, current_pct) = SLA.calcul_current()
		## current_pct: {u'warning': 30.0, u'ok': 20.0, u'critical': 50.0}

		if current_pct['ok'] != 20:
			raise Exception('Invalid pct calculation ...')

	def test_04_check(self):
		
		SLA.data['threshold_warn'] = 10
		SLA.data['threshold_crit'] = 5
		state = SLA.check()

		if state != 0:
			raise Exception('Invalid Ok check ...')

		SLA.data['threshold_warn'] = 30
		SLA.data['threshold_crit'] = 10
		state = SLA.check()

		if state != 1:
			raise Exception('Invalid Warning check ...')


		SLA.data['threshold_warn'] = 40
		SLA.data['threshold_crit'] = 30
		state = SLA.check()

		if state != 2:
			raise Exception('Invalid Critical check ...')

	def test_05_checkCB(self):

		SLA.data['threshold_warn'] = 30
		SLA.data['threshold_crit'] = 15
		SLA.check()

		if STATE != 1:
			raise Exception('Invalid CB Warning check ...')


		SLA.data['threshold_warn'] = 40
		SLA.data['threshold_crit'] = 30
		SLA.check()

		if STATE != 2:
			raise Exception('Invalid CB Critical check ...')

		SLA.data['threshold_warn'] = 10
		SLA.data['threshold_crit'] = 5
		SLA.check()

		if STATE != 0:
			raise Exception('Invalid CB Ok check ...')

	def test_06_calcul_timeperiod_for_id(self):
		(sla, sla_pct) = SLA.calcul_timeperiod_for_id("check1", 0, 100)

		if sla_pct['warning'] == 20 and sla_pct['critical'] == 20 and sla_pct['critical'] == 60:
			raise Exception('Invalid pct calculation for timeperiod ...')

	def test_07_calcul_timeperiod(self):
		SLA.selector.mfilter = { '$or': [{'_id': 'check1'}, {'_id': 'check2'},] }

		(sla, sla_pct) = SLA.calcul_timeperiod(0, 100)

		if sla_pct['warning'] == 12.5 and sla_pct['critical'] == 17.5 and sla_pct['critical'] == 70:
			raise Exception('Invalid pct calculation for timeperiod ...')

	def test_99_DropNamespace(self):
		for HID in HIDS:
			STORAGE.remove(HID, namespace='history')
		STORAGE.drop_namespace('unittest')



if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest')

	SELECTOR = cselector(name="myselector", storage=STORAGE)
	SELECTOR.mfilter = {'source_type': 'service'}

	STORAGE.put(crecord({'_id': 'check1',  'source_type': 'service', 'state': 0, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check2',  'source_type': 'service', 'state': 0, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check3',  'source_type': 'service', 'state': 1, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check4',  'source_type': 'service', 'state': 1, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check5',  'source_type': 'service', 'state': 1, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check6',  'source_type': 'service', 'state': 2, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check7',  'source_type': 'service', 'state': 2, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check8',  'source_type': 'service', 'state': 2, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check9',  'source_type': 'service', 'state': 2, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check10',  'source_type': 'service', 'state': 2, 'state_type': 1}))

	HIDS = []
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 0, 'state_type': 1, 'timestamp': 0}), namespace='history'))
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 1, 'state_type': 1, 'timestamp': 20}), namespace='history')) # 20s -> 0
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 2, 'state_type': 1, 'timestamp': 30}), namespace='history')) # 10s -> 1
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 0, 'state_type': 1, 'timestamp': 35}), namespace='history')) # 5s  -> 2
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 2, 'state_type': 1, 'timestamp': 50}), namespace='history')) # 15s -> 0
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 0, 'state_type': 1, 'timestamp': 65}), namespace='history')) # 15s -> 2
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 1, 'state_type': 1, 'timestamp': 80}), namespace='history')) # 15s -> 0
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 0, 'state_type': 1, 'timestamp': 90}), namespace='history')) # 10s -> 1
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check1', 'state': 2, 'state_type': 1, 'timestamp': 100}), namespace='history'))# 10s -> 0

	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check2', 'state': 0, 'state_type': 1, 'timestamp': 0}), namespace='history'))
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check2', 'state': 1, 'state_type': 1, 'timestamp': 5}), namespace='history'))  # 5s  -> 0
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check2', 'state': 2, 'state_type': 1, 'timestamp': 10}), namespace='history')) # 5s  -> 1
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check2', 'state': 0, 'state_type': 1, 'timestamp': 20}), namespace='history')) # 10s -> 2
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check2', 'state': 2, 'state_type': 1, 'timestamp': 60}), namespace='history')) # 40s -> 0
	HIDS.append(STORAGE.put(crecord({'inventory_id': 'check2', 'state': 0, 'state_type': 1, 'timestamp': 65}), namespace='history')) # 5s  -> 2
																	 # 35s -> 0

	unittest.main(verbosity=2)
	



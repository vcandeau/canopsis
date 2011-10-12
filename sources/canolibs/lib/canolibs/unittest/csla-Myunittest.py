#!/usr/bin/env python

import unittest

from csla import csla

from caccount import caccount
from cstorage import cstorage
from cselector import cselector
from crecord import crecord

import time

import logging

STORAGE = None
SELECTOR = None
SLA = None
STATE = 0

def cb_on_state_change(from_state, to_state):
	global STATE
	STATE = to_state

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_InitPutGet(self):
		global SLA
		SLA = csla(name="mysla", storage=STORAGE, namespace='unittest', logging_level=logging.DEBUG)
		SLA.mfilter = {'source_type': 'service' }
	 
		SLA.set_threshold(10,5)
		SLA.set_cycle(0, 100, False)

		_id = SLA._id

		## Put in db
		STORAGE.put(SLA)
		record = STORAGE.get(_id)

		## Load
		SLA = csla(name="mysla", storage=STORAGE)
		SLA = csla(_id=_id, storage=STORAGE)
		SLA = csla(record=record, storage=STORAGE)


	def test_02_calcul_timeperiod_for_id(self):
		(sla, sla_pct) = SLA.calcul_by_timeperiod_for_id("check1", 0, 100)

		if sla_pct['warning'] == 20 and sla_pct['critical'] == 20 and sla_pct['critical'] == 60:
			raise Exception('Invalid pct calculation for timeperiod ...')

	def test_03_calcul_timeperiod(self):
		SLA.mfilter = { '$or': [{'_id': 'check1'}, {'_id': 'check2'},] }

		(sla, sla_pct) = SLA.calcul_by_timeperiod(0, 100)

		if sla_pct['warning'] == 12.5 and sla_pct['critical'] == 17.5 and sla_pct['critical'] == 70:
			raise Exception('Invalid pct calculation for timeperiod ...')


	def test_04_check(self):
		SLA.get_sla(stop=100, cachetime=-1)

		SLA.set_threshold(60,50)
		state = SLA.check()

		if state != 0:
			raise Exception('Invalid Ok check ...')

		SLA.set_threshold(80,60)
		state = SLA.check()

		if state != 1:
			raise Exception('Invalid Warning check ...')


		SLA.set_threshold(90,80)
		state = SLA.check()

		if state != 2:
			raise Exception('Invalid Critical check ...')

	
	def test_05_checkCB(self):
		SLA.cb_on_state_change = cb_on_state_change

		SLA.set_threshold(80,60)
		SLA.check()

		if STATE != 1:
			raise Exception('Invalid CB Warning check ...')


		SLA.set_threshold(90,80)
		SLA.check()

		if STATE != 2:
			raise Exception('Invalid CB Critical check ...')

		SLA.set_threshold(60,50)
		SLA.check()

		if STATE != 0:
			raise Exception('Invalid CB Ok check ...')


	def test_06_process_hourly(self):
		SLA.process_hourly(time.time())

	def test_07_process_daily(self):
		SLA.process_daily(time.time())

	def test_99_DropNamespace(self):
		for HID in HIDS:
			STORAGE.remove(HID, namespace='history')
		STORAGE.drop_namespace('unittest')


if __name__ == "__main__":
	STORAGE = cstorage(caccount(user="root", group="root"), namespace='unittest', logging_level=logging.INFO)

	HIDS = []
	
	STORAGE.put(crecord({'_id': 'check1',  'source_type': 'service', 'state': 0, 'state_type': 1}))
	STORAGE.put(crecord({'_id': 'check2',  'source_type': 'service', 'state': 0, 'state_type': 1}))

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
	



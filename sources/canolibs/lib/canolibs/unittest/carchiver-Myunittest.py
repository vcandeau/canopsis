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

import unittest, logging

from carchiver import carchiver

ARCHIVER = None

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Init(self):
		global ARCHIVER
		ARCHIVER = carchiver(namespace='unittest',  autolog=True)
		ARCHIVER.remove_all()

	def test_02_Check(self):
		event = { 'state': 0, 'state_type': 1 }
		event_id = 'unit.test'

		if not ARCHIVER.check_event(event_id, event):
			raise Exception('[1] Invalid check ...')

		if ARCHIVER.check_event(event_id, event):
			raise Exception('[2] Invalid check ...')
		
		## Ok -> critical
		event = { 'state': 2, 'state_type': 0 }

		if not ARCHIVER.check_event(event_id, event):
			raise Exception('[3] Invalid check ...')

		## critical -> Ok
		event = { 'state': 0, 'state_type': 1 }

		if not ARCHIVER.check_event(event_id, event):
			raise Exception('[4] Invalid check ...')

	def test_03_Log(self):
		records = ARCHIVER.get_logs('unit.test')
		if len(records) != 2:
			raise Exception('Invalid logs count ...')

	def test_99_DropNamespace(self):
		ARCHIVER.remove_all()

if __name__ == "__main__":
	unittest.main(verbosity=2)
	



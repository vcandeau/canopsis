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

import unittest

import os, sys, logging

sys.path.append(os.path.expanduser("~/opt/amqp2brule/checks/"))
sys.path.append(os.path.expanduser("./"))
sys.path.append(os.path.expanduser("../"))

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger("unittest")

from check_state import check_state

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass


	def test_01_check_state_ok(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 0},
			'id3': {'state': 0},
		}
		state = check_state(logger, env)

		if state != 0:
			raise Exception('Not Ok state ...')

	def test_02_check_state_warn(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 1},
			'id3': {'state': 0},
		}
		state = check_state(logger, env)

		if state != 1:
			raise Exception('Not Warn state ...')

	def test_03_check_state_crit(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 1},
			'id3': {'state': 2},
		}
		state = check_state(logger, env)

		if state != 2:
			raise Exception('Not Crit state ...')


if __name__ == "__main__":
	unittest.main(verbosity=2)
	



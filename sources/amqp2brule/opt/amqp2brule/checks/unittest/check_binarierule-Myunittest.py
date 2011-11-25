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

from check_binarierule import check_binarierule
from check_binarierule import parse_key

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass


	def test_00_check_binarierule(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 1},
			'id3': {'state': 2},
		}

		if not parse_key("id|state|id1", 0, env):
			raise Exception('Error in parse_key ...')


	def test_01_check_binarierule_and(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 1},
			'id3': {'state': 2},
		}

		rule = { 'and' : [
				{'id|state|id1': 0},
				{'id|state|id2': 1},
				{'id|state|id3': 2},
		]}

		state = check_binarierule(logger, env, ok_rule=rule)

		if state != 0:
			raise Exception('Invalid state ...')

	def test_02_check_binarierule_or(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 1},
			'id3': {'state': 2},
		}

		rule = { 'or' : [
				{'id|state|id1': 1},
				{'id|state|id2': 0},
				{'id|state|id3': 2},
		]}

		state = check_binarierule(logger, env, ok_rule=rule)

		if state != 0:
			raise Exception('Invalid state ...')

	def test_03_check_binarierule_andor(self):
		env={
			'id1': {'state': 0},
			'id2': {'state': 1},
			'id3': {'state': 2},
		}

		rule = { 'and' : [
				{'id|state|id1': 0},
				{'id|state|id2': 1},
				{ 'or' : [
					{'id|state|id3': 0},
					{'id|state|id3': 1},
					{'id|state|id3': 2},
				]}
		]}

		state = check_binarierule(logger, env, ok_rule=rule)

		if state != 0:
			raise Exception('Invalid state ...')

if __name__ == "__main__":
	unittest.main(verbosity=2)
	



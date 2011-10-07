#!/usr/bin/env python
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
	



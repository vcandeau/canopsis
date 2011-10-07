#!/usr/bin/env python
import unittest

import os, sys, logging
sys.path.append(os.path.expanduser("~/opt/amqp2brule/checks/"))
sys.path.append(os.path.expanduser("./"))
sys.path.append(os.path.expanduser("../"))

from check_state_lessmore import check_state_less
from check_state_lessmore import check_state_more

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger("unittest")


def check_state(result, state):
	if result != state:
		raise Exception('Invalid state ...')



class KnownValues(unittest.TestCase): 
	def setUp(self):
		global env
		env={
			'id1': {'state': 0},
			'id2': {'state': 0},
			'id3': {'state': 0},
			'id4': {'state': 0},
			'id5': {'state': 0},
			'id6': {'state': 2},
			'id7': {'state': 2},
			'id8': {'state': 2},
			'id9': {'state': 2},
			'id10': {'state': 0},
		}


	def test_01_check_state_more_crit(self):
		# 6 Ok in env

		# si il y a PLUS de 7 OK dans env alors CRIT
		check = check_state_more(logger, env, state=0, tcrit=7)
		check_state(check, 0)

		# si il y a PLUS de 6 OK dans env alors CRIT
		check = check_state_more(logger, env, state=0, tcrit=6)
		check_state(check, 2)

		# si il y a PLUS de 5 OK dans env alors CRIT
		check = check_state_more(logger, env, state=0, tcrit=5)
		check_state(check, 2)

	def test_02_check_state_more_warn(self):
		# 6 Ok in env

		# si il y a PLUS de 7 OK dans env alors WARN
		# si il y a PLUS de 8 OK dans env alors CRIT
		check = check_state_more(logger, env, state=0, twarn=7, tcrit=8)
		check_state(check, 0)

		# si il y a PLUS de 6 OK dans env alors WARN
		# si il y a PLUS de 7 OK dans env alors CRIT
		check = check_state_more(logger, env, state=0, twarn=6, tcrit=7)
		check_state(check, 1)

		# si il y a PLUS de 5 OK dans env alors WARN
		# si il y a PLUS de 6 OK dans env alors CRIT
		check = check_state_more(logger, env, state=0, twarn=5, tcrit=6)
		check_state(check, 2)	

	def test_03_check_state_less(self):
		
		# 6 Ok in env

		# si il y a MOINS de 7 OK dans env alors CRIT
		check = check_state_less(logger, env, state=0, tcrit=7)
		check_state(check, 2)

		# si il y a MOINS de 6 OK dans env alors CRIT
		check = check_state_less(logger, env, state=0, tcrit=6)
		check_state(check, 2)

		# si il y a MOINS de 5 OK dans env alors CRIT
		check = check_state_less(logger, env, state=0, tcrit=5)
		check_state(check, 0)

	def test_03_check_state_less_warn(self):
		
		# 6 Ok in env

		# si il y a MOINS de 7 OK dans env alors WARN
		# si il y a MOINS de 6 OK dans env alors CRIT
		check = check_state_less(logger, env, state=0, twarn=7, tcrit=6)
		check_state(check, 2)

		# si il y a MOINS de 6 OK dans env alors WARN
		# si il y a MOINS de 5 OK dans env alors CRIT
		check = check_state_less(logger, env, state=0, twarn=6, tcrit=5)
		check_state(check, 1)

		# si il y a MOINS de 5 OK dans env alors WARN
		# si il y a MOINS de 4 OK dans env alors CRIT
		check = check_state_less(logger, env, state=0, twarn=5, tcrit=4)
		check_state(check, 0)


if __name__ == "__main__":
	unittest.main(verbosity=2)
	



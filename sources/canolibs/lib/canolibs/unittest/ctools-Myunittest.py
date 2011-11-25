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

from ctools import calcul_pct
from ctools import parse_perfdata

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Perfdata(self):
		result = {'load1': {'warn': 5.0, 'crit': 10.0, 'metric': 'load1', 'value': 0.44, 'min': 0.0}, 'load15': {'warn': 3.0, 'crit': 4.0, 'metric': 'load15', 'value': 0.13, 'min': 0.0}, 'load5': {'warn': 4.0, 'crit': 6.0, 'metric': 'load5', 'value': 0.19, 'min': 0.0}}
		perf_data = "load1=0.440;5.000;10.000;0; load5=0.190;4.000;6.000;0; load15=0.130;3.000;4.000;0;"
		perf_data = parse_perfdata(perf_data)
		if perf_data != result:
			print perf_data
			raise Exception('Error in perfdata parsing ...')

		result = {'load1': {'metric': 'load1', 'value': 0.440}}
		perf_data = "load1=0.440"
		perf_data = parse_perfdata(perf_data)
		if perf_data != result:
			print perf_data
			raise Exception('Error in perfdata parsing ...')


		result = {'warn': {'min': 0.0, 'max': 100.0, 'metric': 'warn', 'value': 0.0, 'warn': 0.0, 'crit': 0.0, 'unit': '%'}, 'crit': {'min': 0.0, 'max': 100.0, 'metric': 'crit', 'value': 0.0, 'warn': 0.0, 'crit': 0.0, 'unit': '%'}, 'ok': {'min': 0.0, 'max': 100.0, 'metric': 'ok', 'value': 100.0, 'warn': 98.0, 'crit': 95.0, 'unit': '%'}}
		perf_data = "'ok'=100.0%;98;95;0;100 'warn'=0%;0;0;0;100 'crit'=0%;0;0;0;100"
		perf_data = parse_perfdata(perf_data)
		if perf_data != result:
			print perf_data
			raise Exception('Error in perfdata parsing ...')

	def test_02_calcul_pct(self):
		result = {'unknown': 23.01, 'warning': 41.0, 'ok': 26.55, 'critical': 9.44}
		data = {'ok': 90, 'warning': 139, 'critical': 32, 'unknown': 78}
		pct = calcul_pct(data)
		if pct != result:
			raise Exception('Error in pct calculation ...')
	
		
if __name__ == "__main__":
	unittest.main(verbosity=1)
	



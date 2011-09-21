#!/usr/bin/env python

import unittest

from ctools import calcul_pct
from ctools import parse_perfdata

class KnownValues(unittest.TestCase): 
	def setUp(self):
		pass

	def test_01_Perfdata(self):
		result = {'load1': {'warn': '5.000', 'crit': '10.000', 'metric': 'load1', 'value': '0.440', 'min': '0'}, 'load15': {'warn': '3.000', 'crit': '4.000', 'metric': 'load15', 'value': '0.130', 'min': '0'}, 'load5': {'warn': '4.000', 'crit': '6.000', 'metric': 'load5', 'value': '0.190', 'min': '0'}}
		perf_data = "load1=0.440;5.000;10.000;0; load5=0.190;4.000;6.000;0; load15=0.130;3.000;4.000;0;"
		perf_data = parse_perfdata(perf_data)
		if perf_data != result:
			raise Exception('Error in perfdata parsing ...')

		result = {'load1': {'metric': 'load1', 'value': '0.440'}}
		perf_data = "load1=0.440"
		perf_data = parse_perfdata(perf_data)
		if perf_data != result:
			raise Exception('Error in perfdata parsing ...')


		result = {'warn': {'min': '0', 'max': '100', 'metric': 'warn', 'value': '0', 'warn': '0', 'crit': '0', 'unit': '%'}, 'crit': {'min': '0', 'max': '100', 'metric': 'crit', 'value': '0', 'warn': '0', 'crit': '0', 'unit': '%'}, 'ok': {'min': '0', 'max': '100', 'metric': 'ok', 'value': '100.0', 'warn': '98', 'crit': '95', 'unit': '%'}}
		perf_data = "'ok'=100.0%;98;95;0;100 'warn'=0%;0;0;0;100 'crit'=0%;0;0;0;100"
		perf_data = parse_perfdata(perf_data)
		if perf_data != result:
			raise Exception('Error in perfdata parsing ...')

	def test_02_calcul_pct(self):
		result = {'unknown': 23.01, 'warning': 41.0, 'ok': 26.55, 'critical': 9.44}
		data = {'ok': 90, 'warning': 139, 'critical': 32, 'unknown': 78}
		pct = calcul_pct(data)
		if pct != result:
			raise Exception('Error in pct calculation ...')
	
		
if __name__ == "__main__":
	unittest.main(verbosity=1)
	



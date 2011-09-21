#!/usr/bin/env python

import re

legend = ['ok','warning','critical','unknown']

def calcul_pct(data, total=None):
	if not total:
		## Get total
		total = 0
		for key in data.keys():
			value = data[key]
			total += value
	## Calc pct
	data_pct = {}
	for key in data.keys():
		value = data[key]
		data_pct[key] = round(((float(value) * 100) / float(total)), 2)

	## Fix empty value
	for key in legend:
		try:
			value = data_pct[key]
		except:
			data_pct[key] = 0

	return data_pct


def parse_perfdata(perf_data):
		# 'label'=value[UOM];[warn];[crit];[min];[max]
		#   load1=0.440     ;5.000 ;10.000;0    ;
		perfs = perf_data.split(' ')

		perf_data_array = {}
		for perf in perfs:
			perf_data = {}
			perf = perf.replace(',','.')
			resultat = re.search("'?(\w*)'?=([0-9.,]*)(([A-Za-z%%/]*))(;([0-9.,]*))?(;([0-9.,]*))?(;([0-9.,]*))?(;([0-9.,]*))?",perf);
			
			perf_data['metric'] = resultat.group(1)
			perf_data['value'] = resultat.group(2)
			perf_data['unit'] = resultat.group(4)
			perf_data['warn'] = resultat.group(6)
			perf_data['crit'] = resultat.group(8)
			perf_data['min'] = resultat.group(10)
			perf_data['max'] = resultat.group(12)

			perf_data_clean = {}
			for key in perf_data.keys():
				if perf_data[key]:
					perf_data_clean[key] = perf_data[key]

			
			perf_data_array[perf_data_clean['metric']] = perf_data_clean

		return perf_data_array


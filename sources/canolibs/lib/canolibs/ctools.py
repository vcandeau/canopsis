#!/usr/bin/env python

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

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

import re, logging, socket, time

legend = ['ok','warning','critical','unknown']


logging_level=logging.INFO

logger = logging.getLogger('ctools')
logger.setLevel(logging_level)

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
			resultat = re.search("'?([0-9A-Za-z/]*)'?=([0-9.,]*)(([A-Za-z%%/]*))(;([0-9.,]*))?(;([0-9.,]*))?(;([0-9.,]*))?(;([0-9.,]*))?",perf);
			
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
					try:
						perf_data_clean[key] = float(perf_data[key])
					except:
						perf_data_clean[key] = perf_data[key]

			
			perf_data_array[perf_data_clean['metric']] = perf_data_clean

		return perf_data_array


def dynmodloads(path=".", subdef=False, pattern=".*"):
	import os, sys

	loaded = {}
	path=os.path.expanduser(path)
	logger.debug("Append path '%s' ..." % path)
	sys.path.append(path)

	try:
		for mfile in os.listdir(path):
			try:
				ext = mfile.split(".")[1]
				name = mfile.split(".")[0]

				if name != "." and ext == "py" and name != '__init__':
					logger.info("Load '%s' ..." % name)
					try:

						module = __import__(name)
						loaded[name] = module
	
						if subdef:
							alldefs = dir(module)
							for mydef in alldefs:
								if mydef not in ["__builtins__", "__doc__", "__file__", "__name__", "__package__"]:
									if re.search(pattern, mydef):
										logger.debug(" + From %s import %s ..." % (name, mydef))
										#exec "from %s import %s" % (name, mydef)
										exec "loaded[mydef] = module.%s" % mydef
						
						 
						logger.debug(" + Success")
					except Exception, err:
						logger.error("\t%s" % err)
			except:
				pass
	except:
		pass

	return loaded

def make_event(service_description, source_name='internal', source_type='service', host_name=None, state_type=1, state=0, output='', perf_data=''):
	if not host_name:
		host_name = socket.gethostname()

	dump = {}
	dump['source_name'] = source_name
	dump['source_type'] = source_type
	dump['service_description'] =  service_description
	dump['host_name'] = host_name
	dump['rk'] = 'canopsis.' + dump['source_name'] + '.check.'+ dump['source_type'] + "." + dump['host_name'] + "." + dump['service_description']
	dump['state_type'] = state_type
	dump['state'] = state
	dump['output'] = output
	dump['timestamp'] = int(time.time())
	dump['perf_data'] = perf_data
	return dump


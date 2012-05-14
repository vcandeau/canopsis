#!/usr/bin/env python
# --------------------------------
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

import sys, os, logging, json, time

import bottle
from bottle import route, get, post, put, delete, request, HTTPError, response

#import protection function
from libexec.auth import check_auth, get_account

# Modules
from pyperfstore import pmath
from pyperfstore import node
from pyperfstore import mongostore
from ctools import parse_perfdata

import ConfigParser
config = ConfigParser.RawConfigParser()
config.read(os.path.expanduser('~/etc/cstorage.conf'))

logger = logging.getLogger("perfstore")

perfstore = mongostore(mongo_collection='perfdata', mongo_host=config.get("master", "host"), mongo_port=config.getint("master", "port"))

config.read(os.path.expanduser('~/etc/webserver.conf'))
pyperfstore_aggregate			= True
pyperfstore_aggregate_maxpoints	= 500
pyperfstore_aggregate_method	= "MAX"
try:
	pyperfstore_aggregate			= config.getboolean('pyperfstore', "aggregate")
	pyperfstore_aggregate_maxpoints	= config.getint('pyperfstore', "aggregate_maxpoints")
	pyperfstore_aggregate_method	= config.get('pyperfstore', "aggregate_method")
except:
	pass
	
logger.debug(" + pyperfstore_aggregate: %s" % pyperfstore_aggregate)
logger.debug(" + pyperfstore_aggregate_maxpoints: %s" % pyperfstore_aggregate_maxpoints)
logger.debug(" + pyperfstore_aggregate_method: %s" % pyperfstore_aggregate_method)

#########################################################################

#### GET@
@get('/perfstore/node/:_id',apply=[check_auth])
def perfstore_node_get(_id):
	mynode = node(_id, storage=perfstore)

	output = [ mynode.dump() ]

	return {'total': len(output), 'success': True, 'data': output}


#### POST@
@post('/perfstore/values',apply=[check_auth])
@post('/perfstore/values/:start/:stop',apply=[check_auth])
def perfstore_nodes_get_values(start=None, stop=None):

	nodes = request.params.get('nodes', default=None)
	output = []
	
	if not nodes:
		logger.warning("Invalid arguments")
		return HTTPError(404, "Invalid arguments")

	nodes = json.loads(nodes)
	
	logger.debug("POST:")
	logger.debug(" + nodes: %s" % nodes)

	output = []
	
	for node in nodes:
		if not start and not stop:
			output += perfstore_get_last_value(node['id'], node['metrics'])
		else:
			output += perfstore_get_values(node['id'], node['metrics'], start, stop)

	
	output = {'total': len(output), 'success': True, 'data': output}
 
	return output

#### GET@
@get('/perfstore/values/:_id',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start/:stop',apply=[check_auth])
def perfstore_metric_get_values(_id, metrics="<all>", start=None, stop=None):

	data_type = request.params.get('data_type', default='line')
	
	# Small hack
	metrics = metrics.replace("<slash>", '/')
	metrics = metrics.replace("<bslash>", '\\')
	
	metrics = metrics.split(',')
	if not metrics[len(metrics)-1]:
		del metrics[len(metrics)-1]

	try:
		output = perfstore_get_values(_id, metrics, start, stop)
		output = {'total': len(output), 'success': True, 'data': output}
		
	except:
		output = {'total': 0, 'success': False, 'data': []}
 
	return output

	
@get('/perfstore/metrics/:_id',apply=[check_auth])
def perfstore_getMetric(_id):

	logger.error("GET metrics of '%s'" % _id)

	mynode = node(_id, storage=perfstore)

	metrics = mynode.metric_get_all_dn()
	
	output = []
	if metrics:
		for metric in metrics:
			output.append({'metric': metric })
	
	output = {'total': len(output), 'success': True, 'data': output}
	
	return output



def perfstore_get_last_value(_id, metrics):
	output=[]
	logger.debug(" + node:      %s" % _id)
	logger.debug(" + metrics:   %s" % metrics)
		
	mynode = node(_id, storage=perfstore)
	
	if metrics:
		if (metrics[0] == "<all>"):
			metrics = mynode.metric_get_all_dn()
			logger.debug(" + metrics:   %s" % metrics)

		for dn in metrics:
			metric = mynode.metric_get(dn=dn)
			value = metric.last_point
			value[0] = value[0] * 1000
			
			output.append({'node': _id, 'metric': dn, 'values': [value], 'bunit': metric.bunit, 'min': metric.min_value, 'max': metric.max_value, 'thld_warn': metric.thld_warn_value, 'thld_crit': metric.thld_crit_value})
	
	return output

def perfstore_get_values(_id, metrics, start=None, stop=None):
	
	if start and not stop:
		stop = start
	
	if stop:
		stop = int(int(stop) / 1000)
	else:
		stop = int(time.time())
		
	if start:
		start = int(int(start) / 1000)
	else:
		start = stop - 86400

	logger.debug(" + node:      %s" % _id)
	logger.debug(" + metrics:   %s" % metrics)
	logger.debug(" + start:     %s" % start)
	logger.debug(" + stop:      %s" % stop)
	
	mynode = node(_id, storage=perfstore)
	
	output=[]
	
	if metrics:
		if (metrics[0] == "<all>"):
			metrics = mynode.metric_get_all_dn()
			logger.debug(" + metrics:   %s" % metrics)

		for dn in metrics:
			try:
				values = mynode.metric_get_values(
					dn=dn,
					tstart=start,
					tstop=stop,
					aggregate=pyperfstore_aggregate,
					atype=pyperfstore_aggregate_method,
					max_points=pyperfstore_aggregate_maxpoints
					)
					
				values = [[x[0] * 1000, x[1]] for x in values]

				if len(values) >= 1:
					metric = mynode.metric_get(dn=dn)
					bunit = metric.bunit
					output.append({'node': _id, 'metric': dn, 'values': values, 'bunit': bunit, 'min': metric.min_value, 'max': metric.max_value, 'thld_warn': metric.thld_warn_value, 'thld_crit': metric.thld_crit_value})
						
			except Exception, err:
				logger.error(err)
				
	return output


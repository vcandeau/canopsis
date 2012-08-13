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
from ctools import parse_perfdata

import pyperfstore2
manager = pyperfstore2.manager(logging_level=logging.DEBUG)

import ConfigParser
config = ConfigParser.RawConfigParser()
config.read(os.path.expanduser('~/etc/cstorage.conf'))

logger = logging.getLogger("perfstore")

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

#### POST@
@post('/perfstore/values',apply=[check_auth])
@post('/perfstore/values/:start/:stop',apply=[check_auth])
def perfstore_nodes_get_values(start=None, stop=None, interval=None):

	metas = request.params.get('nodes', default=None)
	
	time_interval = request.params.get('interval', default=None)
	aggregate_method = request.params.get('aggregate_method', default=None)
	use_window_ts = request.params.get('use_window_ts', default=None)
	output = []
	
	if not metas:
		logger.warning("Invalid arguments")
		return HTTPError(404, "Invalid arguments")

	metas = json.loads(metas)
	
	logger.debug("POST:")
	logger.debug(" + metas: %s" % metas)
	logger.debug(" + aggregate_method: %s" % aggregate_method)
	logger.debug(" + use_window_ts:    %s" % use_window_ts)
	logger.debug(" + time_interval:    %s" % time_interval)

	if time_interval:
		try:
			time_interval = int(time_interval)
		except Exception, err:
			logger.error(err)
			return {'total': 0, 'success': False, 'data': []}

	output = []
	
	for meta in metas:
		output += perfstore_get_values(meta['id'], start, stop, time_interval, aggregate_method, use_window_ts)

	
	output = {'total': len(output), 'success': True, 'data': output}
 
	return output
	
#### GET@
@get('/perfstore/values/:component/:metrics',apply=[check_auth])
@get('/perfstore/values/:component/:resource/:metrics',apply=[check_auth])
@get('/perfstore/values/:component/:resource/:metrics/:start',apply=[check_auth])
@get('/perfstore/values/:component/:resource/:metrics/:start/:stop',apply=[check_auth])
def get_values(component=None,resource=None,metrics=None,start=None,stop=None):
	if not component:
		logger.warning("Invalid arguments: component is not defined")
		return HTTPError(404, "Invalid arguments")
		
	if not isinstance(metrics,list):
		metrics = [metrics]
		
	time_interval = request.params.get('interval', default=None)
	aggregate_method = request.params.get('aggregate_method', default=None)
	use_window_ts = request.params.get('use_window_ts', default=None)
	
	if not start:
		start = request.params.get('start', default=None)
	if not stop:
		stop = request.params.get('stop', default=None)
	
	logger.debug("Get:")
	logger.debug(" + component: %s" % component)
	if resource:
		logger.debug(" + resource: %s" % resource)
	logger.debug(" + metrics: %s" % metrics)
	logger.debug(" + start: %s" % start)
	logger.debug(" + stop: %s" % stop)
	logger.debug(" + aggregate_method: %s" % aggregate_method)
	logger.debug(" + use_window_ts:    %s" % use_window_ts)
	logger.debug(" + time_interval:    %s" % time_interval)
	
	output = []
	
	for metric in metrics:
		if resource:
			_id = manager.get_meta_id('%s%s%s' % (component,resource,metric))
		else:
			_id = manager.get_meta_id('%s%s' % (component,metric))
			
		output += perfstore_get_values(_id, start, stop, time_interval, aggregate_method, use_window_ts)

	output = {'total': len(output), 'success': True, 'data': output}
 
	return output


#### GET@
"""
@get('/perfstore/values/:_id',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start/:stop',apply=[check_auth])
@get('/perfstore/values/:_id/:metrics/:start/:stop/:interval',apply=[check_auth])
def perfstore_metric_get_values(_id, metrics="<all>", start=None, stop=None, interval=None):

	data_type = request.params.get('data_type', default='line')
	
	# Small hack
	metrics = metrics.replace("<slash>", '/')
	metrics = metrics.replace("<bslash>", '\\')
	
	metrics = metrics.split(',')
	if not metrics[len(metrics)-1]:
		del metrics[len(metrics)-1]

	try:
		output = perfstore_get_values(_id, metrics, start, stop, interval)
		output = {'total': len(output), 'success': True, 'data': output}
		
	except:
		output = {'total': 0, 'success': False, 'data': []}
 
	return output
"""
"""	
@get('/perfstore/metrics/:_id',apply=[check_auth])
def perfstore_getMetric(_id):

	logger.error("GET metrics of '%s'" % _id)

	mynode = node(_id, storage=perfstore)

	metrics = mynode.metric_get_all_dn()
	
	output = []
	if metrics:
		for metric in metrics:
			output.append({'metric': metric,'node':_id })
	
	output = {'total': len(output), 'success': True, 'data': output}
	
	return output
"""

@get('/perfstore/get_all_metrics',apply=[check_auth])
def perstore_get_all_metrics():
	logger.debug("perstore_get_all_metrics:")
	
	limit		= int(request.params.get('limit', default=20))
	start		= int(request.params.get('start', default=0))
	search		= request.params.get('search', default=None)
	
	logger.debug(" + limit:   %s" % limit)
	logger.debug(" + start:   %s" % start)
	logger.debug(" + search:  %s" % search)
	
	mfilter = None
	
	if search:
		# Todo: Tweak this ...
		fields = ['co', 're', 'me']
		mor = []
		search = search.split(' ')
		if len(search) == 1:
			for field in fields:
				mor.append({field: {'$regex': '.*%s.*' % search[0], '$options': 'i'}})
				
			mfilter = {'$or': mor}
		else:
			mfilter = {'$and': []}
			for word in search:
				mor = []
				for field in fields:
					mor.append({field: {'$regex': '.*%s.*' % word, '$options': 'i'}})	
				mfilter['$and'].append({'$or': mor})
		
	logger.debug(" + mfilter:  %s" % mfilter)
	
	data  = manager.find_meta(limit=0, skip=0, mfilter=mfilter)
	total = data.count()
	data  = [meta for meta in data.skip(start).limit(limit).sort('co')]
	
	return {'success': True, 'data' : data, 'total' : total}


########################################################################
# Functions
########################################################################

"""
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
"""

def perfstore_get_values(_id, start=None, stop=None, time_interval=None, aggregate_method=None,use_window_ts=None):
	
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

	if time_interval:
		time_interval = int(time_interval)
		
	max_points = pyperfstore_aggregate_maxpoints
		
	if not aggregate_method:
		aggregate_method = pyperfstore_aggregate_method
	
	logger.debug("Perfstore get points:")
	logger.debug(" + meta _id:  %s" % _id)
	logger.debug(" + start:     %s" % start)
	logger.debug(" + stop:      %s" % stop)
	logger.debug('Aggregate:')
	logger.debug(' + max_points : %s' % max_points)
	logger.debug(' + interval :   %s' % time_interval)
	
	output=[]
	
	if not _id:
		logger.error("Invalid _id '%s'" % _id)
		return output
	
	if (time_interval):
		start -= start % time_interval
		stop -= stop % time_interval
		max_points = int( round((stop - start) / time_interval + 0.5) )
	
	try:
		(meta, points) = manager.get_points(_id=_id, tstart=start, tstop=stop, return_meta=True)
		points = manager.aggregate(points, max_points=max_points,  mode='by_point')
		
		points = [[point[0] * 1000, point[1]] for point in points]
		
		output.append({'node': _id, 'metric': meta['me'], 'values': points, 'bunit': meta['unit'], 'min': meta['min'], 'max': meta['max'], 'thld_warn': meta['thd_warn'], 'thld_crit': meta['thd_crit']})
		
	except Exception, err:
		logger.error(err)
				
	return output


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
	
	#time_interval		= request.params.get('interval',			default=None)
	aggregate_method	= request.params.get('aggregate_method',	default=None)
	aggregate_interval	= request.params.get('aggregate_interval', default=None)
	aggregate_max_points= request.params.get('aggregate_max_points', default=None)
	#use_window_ts		= request.params.get('use_window_ts',		default=None)
	output = []
	
	if not metas:
		logger.warning("Invalid arguments")
		return HTTPError(404, "Invalid arguments")

	metas = json.loads(metas)
	
	logger.debug("POST:")
	logger.debug(" + metas: %s" % metas)
	logger.debug(" + aggregate_method: %s" % aggregate_method)
	logger.debug(" + aggregate_interval: %s" % aggregate_interval)
	logger.debug(" + aggregate_max_points: %s" % aggregate_max_points)
	#logger.debug(" + use_window_ts:    %s" % use_window_ts)
	#logger.debug(" + time_interval:    %s" % time_interval)

	"""if time_interval:
		try:
			time_interval = int(time_interval)
		except Exception, err:
			logger.error(err)
			return {'total': 0, 'success': False, 'data': []}
	"""

	output = []
	
	for meta in metas:
		output += perfstore_get_values(meta['id'], start, stop, aggregate_method, aggregate_interval)

	
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
		
	#time_interval		= request.params.get('interval', default=None)
	aggregate_method	= request.params.get('aggregate_method', default=None)
	aggregate_interval	= request.params.get('aggregate_interval', default=None)
	aggregate_max_points= request.params.get('aggregate_max_points', default=None)
	#use_window_ts	= 	request.params.get('use_window_ts', default=None)
	
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
	logger.debug(" + aggregate_interval: %s" % aggregate_interval)
	logger.debug(" + aggregate_max_points: %s" % aggregate_max_points)
	#logger.debug(" + use_window_ts:    %s" % use_window_ts)
	#logger.debug(" + time_interval:    %s" % time_interval)
	
	output = []
	
	for metric in metrics:
		if resource:
			_id = manager.get_meta_id('%s%s%s' % (component,resource,metric))
		else:
			_id = manager.get_meta_id('%s%s' % (component,metric))
			
		output += perfstore_get_values(_id, start, stop, aggregate_interval, aggregate_method, aggregate_interval)

	output = {'total': len(output), 'success': True, 'data': output}
 
	return output


#### GET@
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

def perfstore_get_values(_id, start=None, stop=None, aggregate_method=None, aggregate_interval=None, aggregate_max_points=None):
	
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

	if aggregate_interval:
		aggregate_interval = int(aggregate_interval)
	
	if not aggregate_max_points:
		aggregate_max_points = pyperfstore_aggregate_maxpoints
		
	if not aggregate_method:
		aggregate_method = pyperfstore_aggregate_method
	
	logger.debug("Perfstore get points:")
	logger.debug(" + meta _id:    %s" % _id)
	logger.debug(" + start:       %s" % start)
	logger.debug(" + stop:        %s" % stop)
	logger.debug('Aggregate:')
	logger.debug(' + method :     %s' % aggregate_method)
	logger.debug(' + interval :   %s' % aggregate_interval)
	logger.debug(' + max_points : %s' % aggregate_max_points)
	
	output=[]
	
	if not _id:
		logger.error("Invalid _id '%s'" % _id)
		return output
	
	if (aggregate_interval):
		start -= start % aggregate_interval
		stop -= stop % aggregate_interval
		aggregate_max_points = int( round((stop - start) / aggregate_interval + 0.5) )
	
	try:
		(meta, points) = manager.get_points(_id=_id, tstart=start, tstop=stop, return_meta=True)
		
		points =  pyperfstore2.utils.aggregate(points, max_points=aggregate_max_points, interval=aggregate_interval, atype=aggregate_method)
		
		points = [[point[0] * 1000, point[1]] for point in points]
		
		output.append({'node': _id, 'metric': meta['me'], 'values': points, 'bunit': meta['unit'], 'min': meta['min'], 'max': meta['max'], 'thld_warn': meta['thd_warn'], 'thld_crit': meta['thd_crit']})
		
	except Exception, err:
		logger.error(err)
				
	return output


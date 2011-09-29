#!/usr/bin/env python
#https://beaker.groovie.org/

import sys, os, logging, json, time
import ConfigParser

import bottle
from bottle import route, get, put, delete, request, HTTPError, response

import cairo
import pycha.line
from StringIO import StringIO

## Canopsis
from caccount import caccount
from cstorage import cstorage
from crecord import crecord
from cperfstore import cperfstore

## Initialisation

account = caccount(user="root", group="root")
storage = cstorage(account, namespace="object", logging_level=logging.INFO)

perfstore = cperfstore(storage=storage, logging_level=logging.DEBUG)

debug = False

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("rest")

#########################################################################

#### GET@
@get('/perfstore/:_id/:metric')
@get('/perfstore/:_id/:metric/:start')
@get('/perfstore/:_id/:metric/:start/:stop')
def perfstore_get(_id, metric, start=None, stop=None):

	if start:
		start = int(int(start) / 1000)

	if not stop:
		stop = int(time.time())

	if not start:
		start = stop - 86400
		#start = stop - 300

	logger.debug("GET:")
	logger.debug(" + _id: "+str(_id))
	logger.debug(" + metric: "+str(metric))
	logger.debug(" + start: "+str(start))
	logger.debug(" + stop: "+str(stop))

	data = perfstore.get(_id, metric, start, stop)

	values = []

	for value in data:
		values.append([value[0] * 1000, value[1]])

	output = {'metric': metric, 'values': values }
	output = [output]
	output = {'total': len(output), 'success': True, 'data': output}
	
	#logger.debug(" + Output: "+str(output))

	return output


@get('/perfstore_chart/:_id')
#@get('/perfstore_chart/:_id/:start')
#@get('/perfstore_chart/:_id/:start/:stop')
def perfstore_getchart(_id, start=None, stop=None):

	h = int(request.params.get('height', default=200))
	w = int(request.params.get('width', default=600))

	if not stop:
		stop = int(time.time())

	if not start:
		start = stop - 86400
		#start = stop - 300

	logger.debug("GET:")
	logger.debug(" + _id: "+str(_id))
	#logger.debug(" + metric: "+str(metric))
	logger.debug(" + start: "+str(start))
	logger.debug(" + stop: "+str(stop))
	

	_id = "eventsource.nagios.Central.check.service.localhost3.Current Load 1"

	metrics = ['load1', 'load5', 'load15']

	lines_data = {}
	lines_time = {}

	for metric in metrics:
		lines_time[metric] = []
		lines_data[metric] = []
		data = perfstore.get(_id, metric, start, stop)
		for value in data['data']:
		        lines_time[metric].append(value['timestamp'])
		        lines_data[metric].append(float(value['value']))

	
	ticks = []
	#for metric in metrics:
		#ticks = [ dict(v=i, label=i) for i, l in enumerate(lines_time[metrics[0]]) ] 

	#http://solutoire.com/plotr/docs/

	options = {
		    'fillOpacity': 0.5,
		    'shouldFill': True,
 		    'lineWidth': 0.0,
	            'lineColor': '#0f0000',
	            'tickSize': 3.0,
	            'labelColor': '#666666',
	            'labelFont': 'Tahoma',
	            'labelFontSize': 30,
	            'labelWidth': 50.0,
		    'tickSize': 0.1,
		'axis': {
		    'x': {
		        'ticks': ticks,
		        'tickPrecision': 300,
		    },
		    'y': {
		        'tickCount': 4,
		    }
		},
		'background': {
		    #'lineWidth': 0.1,
		    'color': '#ffffff',
		    'lineColor': '#444444',
		    'hide': False,
		},
		
		'colorScheme': {'name': 'gradient', 'args': {'initialColor': 'red'}},
		'legend': {
		    'hide': False,
		},
	    }

	
	Dataset = []
	for metric in metrics:
		Dataset.append( (metric, [(i, l) for i, l in enumerate(lines_data[metric])]) )

	svg_buffer = StringIO()
	surface = cairo.SVGSurface(svg_buffer, int(w), int(h))
	chart = pycha.line.LineChart(surface, options)
	chart.addDataset(Dataset)
	chart.render()

	del chart
	del surface

	response.content_type = 'image/svg+xml'
	svg_buffer.seek(0)
	return svg_buffer.read()


	

	

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

import time

from camqp import camqp

from pymongo import Connection
import json
import logging

from carchiver import carchiver

from ctools import parse_perfdata
from pyperfstore import node
from pyperfstore import mongostore

from ctools import parse_perfdata
from ctools import Str2Number

from cinit import cinit

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2mongodb"
DAEMON_TYPE = "storage"

init 	= cinit()
#logger 	= init.getLogger(DAEMON_NAME, level="DEBUG")
logger 	= init.getLogger(DAEMON_NAME)
handler = init.getHandler(logger)

myamqp = None

## Pyperfstore
rotate_plan = {
	'PLAIN': 1,
	'TSC': 0,
}

# Auto
point_per_dca = None

########################################################
#
#   Callback
#
########################################################
	
def on_message(body, msg):
	event_id = msg.delivery_info['routing_key']
	logger.debug("Check event: %s" % event_id)
	
	if not event_id:
		logger.error("Invalid routing-key '%s'" % event_id)
		logger.error(msg)
		raise Exception("Invalid routing-key '%s'" % event_id)
		
	## Check event format
	try:
		if isinstance(body, str) or isinstance(body, unicode):
			try:
				event = json.loads(body)
			except:
				try:
					# Hack for windows FS -_-
					event = json.loads(body.replace('\\', '\\\\'))
					#event = json.loads(body.replace('\\', '/'))
				except Exception, err:
					raise Exception(err)
		else:
			event = body
	except Exception, err:
		logger.error(err)
		logger.error("Impossible to parse event, Dump:\n%s" % body)
		raise Exception('Impossible to parse event')


	## Metrology
	timestamp = int(event['timestamp'])
	perf_data_array = []
	perf_data = None
	
	## Get perfdata
	try:
		perf_data = event['perf_data']
	except:
		pass
		
	try:
		perf_data_array = list(event['perf_data_array'])
	except:
		pass
	
	### Parse perfdata
	if perf_data:
		logger.debug(' + perf_data: %s', perf_data)
		try:
			perf_data_array = parse_perfdata(perf_data)
		except Exception, err:
			logger.error("Impossible to parse: %s ('%s')" % (perf_data, err))
	
	logger.debug(' + perf_data_array: %s', perf_data_array)
	event['perf_data_array'] = perf_data_array
	
	### Store perfdata
	if perf_data_array:
		try:
			dn = None
			if event['source_type'] == 'resource':
				dn = "%s.%s" % (event['component'], event['resource'])
				
			elif event['source_type'] == 'component':
				dn = event['component']
				
			to_perfstore(	_id=event_id,
							perf_data=perf_data_array,
							timestamp=timestamp,
							dn=dn)
							
		except Exception, err:
			logger.warning("Impossible to store: %s ('%s')" % (perf_data_array, err))
	
	## Archive event
	if   event['event_type'] == 'check' or event['event_type'] == 'clock':
		
		_id = archiver.check_event(event_id, event)
		if _id:
			event['_id'] = _id
			
			## Event to Alert
			amqp.publish(event, event_id, amqp.exchange_name_alerts)

	elif event['event_type'] == 'log':

		archiver.store_event(event_id, event)

		## Alert only non-ok state
		if event['state'] != 0:
			_id = archiver.log_event(event_id, event)
			event['_id'] = _id
			
			## Event to Alert
			amqp.publish(event, event_id, amqp.exchange_name_alerts)

	elif event['event_type'] == 'trap' or event['event_type'] == 'comment':
		## passthrough
		archiver.store_event(event_id, event)
		_id = archiver.log_event(event_id, event)
		event['_id'] = _id

		## Event to Alert
		amqp.publish(event, event_id, amqp.exchange_name_alerts)

	else:
		logger.warning("Unknown event type '%s', id: '%s', event:\n%s" % (event['event_type'], event_id, event))


def parse_value(data, key, default=None):
	try:
		return data[key]
	except:
		return default

def to_perfstore(_id, perf_data, timestamp, dn=None):
	
	if isinstance(perf_data, list):
		try:
			mynode = node(	_id=_id,
							dn=dn,
							storage=perfstore,
							point_per_dca=point_per_dca,
							rotate_plan=rotate_plan)
			
		except Exception, err:
			raise Exception("Imposible to init node: %s (%s)" % (_id, err))

		#[ {'min': 0.0, 'metric': u'rta', 'value': 0.097, 'warn': 100.0, 'crit': 500.0, 'unit': u'ms'}, {'min': 0.0, 'metric': u'pl', 'value': 0.0, 'warn': 20.0, 'crit': 60.0, 'unit': u'%'} ]

		for perf in perf_data:
			
			metric = perf['metric']
			value = perf['value']
			
			dtype = parse_value(perf, 'type')		
			unit = parse_value(perf, 'unit')
			
			if unit:
				unit = str(unit)
				
			vmin = parse_value(perf, 'min')
			vmax = parse_value(perf, 'max')
			vwarn = parse_value(perf, 'warn')
			vcrit = parse_value(perf, 'crit')

			if vmin:
				vmin = Str2Number(vmin)
			if vmax:
				vmax = Str2Number(vmax)
			if vwarn:
				vwarn = Str2Number(vwarn)
			if vcrit:
				vcrit = Str2Number(vcrit)

			value = Str2Number(value)
				
			logger.debug(" + Put metric '%s' (%s %s (%s)) for ts %s ..." % (metric, value, unit, dtype, timestamp))

			try:
				mynode.metric_push_value(dn=metric, unit=unit, value=value, timestamp=timestamp, dtype=dtype, min_value=vmin, max_value=vmax, thld_warn_value=vwarn, thld_crit_value=vcrit)
			except Exception, err:
				logger.warning('Impossible to put value in perfstore (%s) (metric=%s, unit=%s, value=%s)', err, metric, unit, value)
		
		#del mynode
		
		return perf_data
		
	else:
		raise Exception("Imposible to parse: %s (is not a list)" % perf_data)

########################################################
#
#   Main
#
########################################################

amqp=None
archiver=None
perfstore=None

def main():

	handler.run()

	global amqp, archiver, perfstore

	archiver = carchiver(namespace='events',  autolog=True, logging_level=logging.ERROR)
	perfstore = mongostore(mongo_collection='perfdata')

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['#'], on_message, amqp.exchange_name_events, auto_delete=False)

	logger.info("Wait events ...")
	amqp.start()

	handler.wait()

	amqp.stop()
	amqp.join()

	logger.info("Process finished")

if __name__ == "__main__":
	main()

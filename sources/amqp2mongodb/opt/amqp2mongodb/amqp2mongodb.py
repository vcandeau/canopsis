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

from carchiver import carchiver

from ctools import parse_perfdata
from pyperfstore import node
from pyperfstore import mongostore

from ctools import parse_perfdata

from cinit import cinit

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "amqp2mongodb"
DAEMON_TYPE = "storage"

init 	= cinit()
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

	## Try to parse perfdata
	perf_data_array = {}
	perf_data = None
	try:
		try:
			perf_data = str(event['perf_data'])
		except:
			perf_data = dict(event['perf_data_array'])
		
		logger.debug(' + perf_data: %s', perf_data_array)
		try:
			if perf_data:
				timestamp = int(event['timestamp'])
				perf_data_array = to_perfstore(event_id, perf_data, timestamp)
			
		except Exception, err:
			logger.warning("To_perfstore: %s ('%s')" % (err, perf_data))
				
	except Exception, err:
		logger.warning('Invalid perfdata (%s)', err)
	
	
	logger.debug(' + perf_data_array: %s', perf_data_array)
	event['perf_data_array'] = perf_data_array
	
	
	## Archive event
	if   event['event_type'] == 'check' or event['event_type'] == 'clock':

		if archiver.check_event(event_id, event):
			## Event to Alert
			amqp.publish(event, event_id, amqp.exchange_name_alerts)

	elif event['event_type'] == 'log':

		archiver.store_event(event_id, event)

		## Alert only non-ok state
		if event['state'] != 0:
			archiver.log_event(event_id, event)
			## Event to Alert
			amqp.publish(event, event_id, amqp.exchange_name_alerts)

	elif event['event_type'] == 'trap':
		## passthrough
		archiver.store_event(event_id, event)
		archiver.log_event(event_id, event)

		## Event to Alert
		amqp.publish(event, event_id, amqp.exchange_name_alerts)

	else:
		logger.warning("Unknown event type '%s', id: '%s', event:\n%s" % (event['event_type'], event_id, event))



def to_perfstore(_id, perf_data, timestamp):
	
	if isinstance(perf_data, str):
		try:
			perf_data = parse_perfdata(perf_data)
		except Exception, err:
			raise Exception("Imposible to parse: %s (%s)" % (perf_data, err))
			
	if isinstance(perf_data, dict):

		try:
			mynode = node(_id, storage=perfstore, point_per_dca=point_per_dca, rotate_plan=rotate_plan)
			
		except Exception, err:
			raise Exception("Imposible to init node: %s (%s)" % (_id, err))

		#{u'rta': {'min': 0.0, 'metric': u'rta', 'value': 0.097, 'warn': 100.0, 'crit': 500.0, 'unit': u'ms'}, u'pl': {'min': 0.0, 'metric': u'pl', 'value': 0.0, 'warn': 20.0, 'crit': 60.0, 'unit': u'%'}}

		for metric in perf_data.keys():
			
			value = perf_data[metric]['value']
			
			try:
				unit =  perf_data[metric]['unit']
				unit = str(unit)
			except:
				unit = None
			
			if int(value) == value:
				value = int(value)
			else:
				value = float(value)
				
			logger.debug(" + Put metric '%s' (%s %s) for ts %s ..." % (metric, value, unit, timestamp))

			mynode.metric_push_value(dn=metric, unit=unit, value=value, timestamp=timestamp)
		
		#del mynode
		
		return perf_data
		
	else:
		raise Exception("Imposible to parse: %s (is not a dict)" % perf_data)

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

	archiver = carchiver(namespace='events',  autolog=True)
	perfstore = mongostore(mongo_collection='perfdata')

	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['#'], on_message, amqp.exchange_name_events, auto_delete=False)

	logger.info("Wait events ...")
	amqp.start()

	while handler.status():
		time.sleep(1)

	amqp.stop()
	amqp.join()

	logger.info("Process finished")

if __name__ == "__main__":
	main()

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

from ctools import parse_perfdata
from ctools import Str2Number
from cinit import cinit

import cevent
from collectd import types

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "collectd2event"
DAEMON_TYPE = "gateway"

init 	= cinit()
#logger 	= init.getLogger(DAEMON_NAME, level='DEBUG')
logger 	= init.getLogger(DAEMON_NAME)
handler = init.getHandler(logger)

########################################################
#
#   Callback
#
########################################################
	
def on_message(body, msg):
	global last_events
	
	event_id = msg.delivery_info['routing_key']
	
	collectd_info = body.split(' ')
	
	if len(collectd_info) > 0:
		logger.debug(body)
		action	 	= collectd_info[0]
		logger.debug( " + Action: %s" %			action)
	
		if len(collectd_info) == 4 and action == "PUTVAL" :
			cnode	 	= collectd_info[1].split("/")
			component	= cnode[0]
			resource	= cnode[1]
			metric		= cnode[2]
			options		= collectd_info[2]
			values		= collectd_info[3]
			
			logger.debug( " + Options: %s" %	options)
			logger.debug( " + Component: %s" %		component)
			logger.debug( " + Resource: %s" %		resource)
			logger.debug( " + Metric: %s" %		metric)
			logger.debug( " + Raw Values: %s" %		values)

			values = values.split(":")
			
			perf_data_array = []
			
			ctype = None
			try:
				## Know metric
				ctype = types[metric]
			except:
				try:
					ctype = types[metric.split('-')[0]]
					metric = metric.split('-')[1]
				except:
					logger.error("Invalid format '%s'" % body)
					
			try:
				timestamp = int(Str2Number(values[0]))
				values = values[1:]
				logger.debug( "   + Timestamp: %s" % timestamp)
				logger.debug( "   + Values: %s" % values)
				
			except Exception, err:
				logger.error("Impossible to get timestamp or values (%s)" % err)
				
				
			if 	ctype:
				try:	
					i=0
					for value in values:
						name = ctype[i]['name']
						unit = ctype[i]['unit']
						vmin = ctype[i]['min']
						vmax = ctype[i]['max']
						if name == "value":
							name = metric
							
						if metric != name:
							name = "%s-%s" % (metric, name)
							
						data_type = ctype[i]['type']
						
						value = Str2Number(value)
						
						logger.debug( "     + %s" % name)
						logger.debug( "       -> %s (%s)" % (value, data_type))
						i+=1
							
						perf_data_array.append({ 'metric':name, 'value': value, 'type': data_type, 'unit': unit, 'min': vmin, 'max': vmax})
						
				except:
					logger.error("Impossible to parse values '%s'" % values)


			if perf_data_array:
				logger.debug(' + perf_data_array: %s', perf_data_array)
			
				event = cevent.forger(
						connector='collectd',
						connector_name='collectd2event',
						component=component,
						resource=resource,
						timestamp=None,
						source_type='resource',
						event_type='check',
						state=0,
						perf_data_array=perf_data_array
						)
							
				logger.debug("Send Event: %s" % event)
				## send event on amqp
				key = cevent.get_routingkey(event)						
				amqp.publish(event, key, amqp.exchange_name_events)
						
				
		else:
			logger.error("Invalid collectd Action (%s)" % body)
			
		logger.debug("")
		
	else:
		logger.error("Invalid collectd Message (%s)" % body)

########################################################
#
#   Main
#
########################################################

amqp=None

def main():

	handler.run()

	global amqp, perfstore
	
	# AMQP
	amqp = camqp()

	amqp.add_queue(DAEMON_NAME, ['collectd'], on_message, "amq.topic", auto_delete=False)

	logger.info("Wait collectd events on 'amq.topic' ...")
	amqp.start()

	handler.wait()

	amqp.stop()
	amqp.join()

	logger.info("Process finished")

if __name__ == "__main__":
	main()

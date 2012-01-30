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

import unittest
import time, json, logging, sys
import cevent
from camqp import camqp
from cstorage import cstorage
from crecord import crecord
from caccount import caccount
from pyperfstore import node
from pyperfstore import mongostore

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

event = cevent.forger(connector='canopsis', connector_name='unittest', event_type='check', source_type = "component", component="test1", state=0, output="Output_1", perf_data="mymetric=1s;10;20;0;30")
rk = cevent.get_routingkey(event)

myamqp = None
storage = None
perfstore = None
event_alert = None

def on_alert(body, message):
	print "Alert: %s" % body
	global event_alert
	event_alert = body
	
def clean():
		storage.remove(rk)
		records = storage.find({'event_id': rk}, namespace='events_log')
		storage.remove(records, namespace='events_log')
		node(rk, storage=perfstore).remove()	

class KnownValues(unittest.TestCase): 
	def setUp(self):
		self.rcvmsgbody = None

	def test_1_Init(self):
		global myamqp
		myamqp = camqp()
		myamqp.add_queue(	queue_name = "unittest_alerts",
							routing_keys = "#",
							callback = on_alert,
							exchange_name = myamqp.exchange_name_alerts)
		myamqp.start()
		
		global storage
		storage = cstorage(caccount(user="root", group="root"), namespace='events', logging_level=logging.DEBUG)
		
		global perfstore
		perfstore = mongostore(mongo_collection='perfdata')
		
		clean()
		
	def test_2_PubState(self):
		myamqp.publish(event, rk, exchange_name=myamqp.exchange_name_events)
		time.sleep(1)
		
	def test_3_Check_amqp2mongodb(self):
		record = storage.get(rk)
		revent = record.data
		
		if revent['component'] != event['component']:
			raise Exception('Invalid data ...')
			
		if revent['timestamp'] != event['timestamp']:
			raise Exception('Invalid data ...')
			
		if revent['state'] != event['state']:
			raise Exception('Invalid data ...')	
		
		if event_alert != event:
			raise Exception('Invalid alert data ...')
			
		
	def test_4_Check_amqp2mongodb_archiver(self):	
		## change state
		event['state'] = 1
		myamqp.publish(event, rk, exchange_name=myamqp.exchange_name_events)
		time.sleep(1)
		
		records = storage.find({'event_id': rk}, namespace='events_log')
		
		if len(records) != 2:
			raise Exception("Archiver don't work ...")
			
		revent = records[len(records)-1].data
		
		if revent['state'] != event['state']:
			raise Exception('Invalid log state')
			
	def test_5_Check_amqp2mongodb_perfstore(self):
		mynode = node(rk, storage=perfstore)
		mynode.pretty_print()

		values = mynode.metric_get_values('mymetric', int(time.time() - 10), int(time.time()))
		
		if len(values) != 2:
			raise Exception("Perfsore don't work ...")
			
		if values[1][1] != 1:
			raise Exception("Perfsore don't work ...")		
		

	def test_99_Disconnect(self):
		clean()
		myamqp.stop()
		myamqp.join()
		
if __name__ == "__main__":
	unittest.main(verbosity=2)
	

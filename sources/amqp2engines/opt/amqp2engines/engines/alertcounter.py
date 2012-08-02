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

from cengine import cengine
from cstorage import get_storage
from caccount import caccount
import cevent

import logging
		
NAME="alertcounter"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		self.account = caccount(user="root", group="root")
		
	def pre_run(self):
		self.storage = get_storage(namespace='events', account=caccount(user="root", group="root"))		
		self.beat()
	
		
	def work(self, event, *args, **kargs):
		if   event['event_type'] == 'check' or event['event_type'] == 'selector':
			event_id = event['rk']
			
			cleaned_event = cevent.forger(
				connector = event['connector'],
				connector_name = event['connector_name'],
				event_type = event['event_type'],
				source_type= event['source_type'],
				component= event['component'],
				resource= event['resource'],
				state= event['state'],
				state_type= event['state_type'],
				perf_data_array = []
			)
		
			try:
				old_count = None
				old_record = self.storage.get(event_id,account=self.account)
				
				if old_record.data['perf_data_array']:
					for metric in old_record.data['perf_data_array']:
						if metric['metric'] == 'cps_alert_nb':
							old_count = metric['value']
							
				if old_count:
					cleaned_event['perf_data_array'] = [{'metric': 'cps_alert_nb', 'value': old_count+1}]
				else:
					cleaned_event['perf_data_array'] = [{'metric': 'cps_alert_nb', 'value': 1}]

			except Exception,err:
				self.logger.error('Error while fectching source event: %s' % err)
			
			#self.logger.error(cleaned_event)
			
			self.amqp.publish(cleaned_event, event_id, self.amqp.exchange_name_events)
						
		return event

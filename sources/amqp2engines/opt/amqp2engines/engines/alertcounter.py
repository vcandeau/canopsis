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
		self.listened_event_type = ['check','selector','eue','sla']
		self.beat()
	
		
	def work(self, event, *args, **kargs):
		if event['event_type'] in self.listened_event_type:
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
		
			cleaned_event['perf_data_array'] = [{'metric': 'cps_alert_nb', 'value': 1,'type':'COUNTER'}]

			self.logger.debug('publish alert event for %s' % event_id)
			self.amqp.publish(cleaned_event, event_id, self.amqp.exchange_name_events)
						
		return event

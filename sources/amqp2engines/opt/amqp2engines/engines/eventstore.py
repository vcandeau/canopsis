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

from carchiver import carchiver

from cengine import cengine

NAME="eventstore"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.archiver = carchiver(namespace='events',  autolog=True, logging_level=self.logging_level)
		 
	def work(self, event, msg):
		event_id = event['rk']
		
		## Archive event
		if   event['event_type'] == 'check' or event['event_type'] == 'clock':
			
			_id = self.archiver.check_event(event_id, event)
			if _id:
				event['_id'] = _id
				
				## Event to Alert
				self.amqp.publish(event, event_id, self.amqp.exchange_name_alerts)

		elif event['event_type'] == 'trap' or event['event_type'] == 'comment' or event['event_type'] == 'log':
			
			## passthrough
			self.archiver.store_event(event_id, event)
			_id = self.archiver.log_event(event_id, event)
			event['_id'] = _id

			## Event to Alert
			self.amqp.publish(event, event_id, self.amqp.exchange_name_alerts)
			
		elif event['event_type'] == 'user' :
			## passthrough
			_id = self.archiver.log_event(event_id, event)
			event['_id'] = _id

			## Event to Alert
			self.amqp.publish(event, event_id, self.amqp.exchange_name_alerts)

		else:
			self.logger.warning("Unknown event type '%s', id: '%s', event:\n%s" % (event['event_type'], event_id, event))
			
		return event

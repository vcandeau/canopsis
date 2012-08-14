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
import pyperfstore2

import logging
		
NAME="alertcounter"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
	def pre_run(self):
		self.listened_event_type = ['check','selector','eue','sla']
		self.manager = pyperfstore2.manager(logging_level=self.logging_level)	
		
	def work(self, event, *args, **kargs):
		if event['event_type'] in self.listened_event_type:
			if not event['resource']:
				self.logger.debug('Incrementing "%s" alert metric' % event['component'])
				name = "%s%s" % (event['component'], 'cps_alert_nb')
				self.manager.push(name=name, value=1, meta_data={'type': 'COUNTER', 'co': event['component'], 'me': 'cps_alert_nb'})	
			else:
				self.logger.debug('Incrementing "%s %s" alert metric' % (event['component'],event['resource']))
				name = "%s%s%s" % (event['component'], event['resource'], 'cps_alert_nb')
				self.manager.push(name=name, value=1, meta_data={'type': 'COUNTER', 'co': event['component'], 're': event['resource'], 'me': 'cps_alert_nb'})	
			
		return event

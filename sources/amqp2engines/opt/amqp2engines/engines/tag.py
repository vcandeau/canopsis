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

NAME="tag"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.selectors = []
		
	def add_tag(self, event, field):
		try:
			if event[field]:
				if event[field] not in event['tags']:
					event['tags'].append(event[field])
		except:
			pass
			
		return event
		
	def work(self, event, msg):
		try:
			event['tags']
		except:
			event['tags'] = []

		event = self.add_tag(event, 'event_type')
		event = self.add_tag(event, 'source_type')
		event = self.add_tag(event, 'component')
		event = self.add_tag(event, 'resource')
		
		return event

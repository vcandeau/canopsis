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

import socket, time

def forger(		connector,
			connector_name,
			event_type,
			source_type='component',
			component=None,
			resource=None,	
			timestamp=None,
			state=0,
			state_type=1,
			output=None,
			long_output=None,
			perf_data=None
		):

	if not timestamp:
		timestamp=int(time.time())

	if not component:
		component = socket.gethostname()

	dump = {
		'connector':		connector,
		'connector_name':	connector_name,
		'event_type':		event_type,
		'source_type':		source_type,
		'component':		component,
		'resource':		resource,	
		'timestamp':		timestamp,
		'state':		state,
		'state_type':		state_type,
		'output':		output,
		'long_output':		long_output,
		'perf_data':		perf_data
	}

	return dump

def get_routingkey(event):
	rk = "%s.%s.%s.%s.%s" % (event['connector'], event['connector_name'], event['event_type'], event['source_type'], event['component'])

	if event['resource']:
		rk += ".%s" % event['resource']

	return rk

#!/usr/bin/env python
# --------------------------------
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

import sys, os, logging, json

import bottle
from bottle import route, get, put, delete, request, HTTPError, post, response

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord

from camqp import camqp
import cevent

#import protection function
from libexec.auth import check_auth, get_account

logger = logging.getLogger('Event')

##################################################################################

@get('/sendEvent/',apply=[check_auth])
@get('/sendEvent/:connector',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type/:source_type',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type/:source_type/:resource',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type/:source_type/:resource/:state',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type/:source_type/:resource/:state/:state_type',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type/:source_type/:resource/:state/:state_type/:output',apply=[check_auth])
@get('/sendEvent/:connector/:connector_name/:event_type/:source_type/:resource/:state/:state_type/:output/:long_output',apply=[check_auth])
def send_event(connector=None,
				connector_name=None,
				event_type=None,
				source_type=None,
				resource=None,
				state=None,
				state_type=None,
				output=None,
				long_output=None
			):
	#-----------------------get params-------------------
	if not connector:
		connector = request.params.get('connector', default=None)
		if not connector :
			return HTTPError(400, 'Missing connector argument')
			
	if not connector_name:
		connector_name = request.params.get('connector_name', default=None)
		if not connector_name:
			return HTTPError(400, 'Missing connector name argument')
			
	if not event_type:
		event_type = request.params.get('event_type', default=None)
		if not event_type:
			return HTTPError(400, 'Missing event type argument')
		
	if not source_type:
		source_type = request.params.get('source_type', default=None)
		if not source_type:
			return HTTPError(400, 'Missing source type argument')
		
	if not resource:
		resource = request.params.get('resource', default=None)
		if not resource:
			return HTTPError(400, 'Missing resource argument')
		
	if not state:
		state = request.params.get('state', default=None)
		if not state:
			return HTTPError(400, 'Missing state argument')
		
	if not state_type:
		state_type = request.params.get('state_type', default=1)
		
	if not output:
		output = request.params.get('output', default=None)
		
	if not long_output:
		long_output = request.params.get('long_output', default=None)
		
	return 'success'

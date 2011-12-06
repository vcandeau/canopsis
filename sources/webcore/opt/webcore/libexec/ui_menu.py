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
from bottle import route, get, put, delete, request, HTTPError

## Canopsis
from cstorage import get_storage
from libexec.auth import check_auth, get_account

logger = logging.getLogger("ui-menu")

#########################################################################

#### GET
@get('/ui/menu',apply=[check_auth])
def get_all_menu():
	_id = request.params.get('node', default=[])

	#if _id == 'root' means we want all menu
	if _id == 'root':
		_id = []

	account = get_account()
	storage = get_storage(namespace='object')
	
	#if _id == 'menu.view' catch all view, parsed them and give them in json
	if _id == 'menu.view':
		logger.debug('menu.view catched ------------------------------------------------->')
		mfilter = {'crecord_type': 'view'}
		
		records = storage.find(mfilter,account=account)
		#logger.debug(str(records))
		output = []
		for record in records:
			## Check if view is not pointed by menu
			mfilter = { 'crecord_type': 'menu', 'view': record._id  }
			item = storage.find_one(mfilter,account=account)
			if not item:
				logger.debug(str(record.dump()))
				data = record.data
				#data['id'] = str(record._id)
				data['text'] = record.name
				data['view'] = record._id
				data['leaf'] = True
				if 'template' in data:
					if not data['template'] == True:
						output.append(data)
				else:
					output.append(data)
				
		output = json.dumps(output)
		#logger.debug(" + Output: "+str(output))
		return output
	###############

	logger.debug("Get menu:")
	logger.debug(" + Node: "+str(_id))

	records = storage.get_childs_of_parent(_id, rtype='menu', account=account)

	output = []
	for record in records:
		data = record.data
		data['id'] = str(record._id)
		data['text'] = record.name
		output.append(data)

	output = json.dumps(output)
	return output



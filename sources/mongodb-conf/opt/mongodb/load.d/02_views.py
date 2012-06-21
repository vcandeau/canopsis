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

from caccount import caccount
from cstorage import get_storage
from crecord import crecord

logger = None

##set root account
root = caccount(user="root", group="root")
storage = get_storage(account=root, namespace='object')

def init():
	### Default Dasboard
	data = [{'position': {'width': 8, 'top': 2, 'left': 8, 'height': 7}, 'data': {'bar_search': False, 'show_last_check': True, 'xtype': 'list', 'pageSize': 100, 'title': 'Resource problems', 'show_source_type': True, 'border': True, 'default_sort_direction': 'DESC', 'scroll': True, 'filter': '{ "$and": [ {"source_type":"resource"}, {"state": { "$ne": 0 }} ]}', 'default_sort_column': 'state', 'paging': False, 'show_resource': True, 'reload': False, 'show_state': True, 'refreshInterval': 300, 'show_output': True, 'show_state_type': True, 'column_sort': True, 'hideHeaders': False, 'show_component': True}, 'id': '1336723949800-5'}, {'position': {'width': 8, 'top': 2, 'left': 0, 'height': 7}, 'data': {'bar_search': False, 'show_last_check': True, 'xtype': 'list', 'pageSize': 100, 'title': 'Component problems', 'show_source_type': True, 'border': True, 'default_sort_direction': 'DESC', 'scroll': True, 'filter': '{ "$and": [ {"source_type":"component"}, {"state": { "$ne" : 0 }} ]}', 'default_sort_column': 'state', 'paging': False, 'show_resource': False, 'reload': False, 'show_state': True, 'refreshInterval': 300, 'show_output': True, 'show_state_type': True, 'column_sort': True, 'hideHeaders': False, 'show_component': True}, 'id': '1336724023524-4'}, {'position': {'width': 4, 'top': 0, 'left': 0, 'height': 2}, 'data': {'refreshInterval': 0, 'title': '', 'border': False, 'xtype': 'text', 'text': '<img src="themes/canopsis/resources/images/logo_canopsis.png" height="100%">'}, 'id': '1336724801997-7'}]
	create_view('_default_.dashboard', 'Dashboard', data)
		
	### Account
	data = { 'xtype': 'AccountGrid'}
	create_view('account_manager', 'Accounts', data)

	### Group
	data = { 'xtype': 'GroupGrid'}
	create_view('group_manager', 'Groups', data)

	### Components
	data = {'xtype': 'list', 'filter': '{"$and": [{"source_type":"component"}, {"event_type": {"$ne": "comment"}}, {"event_type": {"$ne": "user"}}]}', 'show_resource': False}
	create_view('components', 'Components', data)

	### Resources
	data = { 'xtype': 'list', 'filter': '{"$and": [{"source_type":"resource"}, {"event_type": {"$ne": "comment"}}, {"event_type": {"$ne": "user"}}]}'}
	create_view('resources', 'Resources', data)

	### View manager
	data = { 'xtype': 'ViewTreePanel'}
	create_view('view_manager', 'Views', data)

	###task
	data = { 'xtype': 'ScheduleGrid'}
	create_view('schedule_manager', 'Schedules', data)

	###briefcase
	data = { 'xtype': 'BriefcaseGrid'}
	create_view('briefcase', 'Briefcase', data)
	
	###curves
	data = { 'xtype': 'CurvesGrid'}
	create_view('curves', 'Curves', data)

	###metric_navigator
	#data = {'xtype': 'MetricNavigation'}
	#create_view('metric_navigation', 'Metrics Navigation', data)

def update():
	init()

def create_view(_id, name, data, position=None, mod='o+r', autorm=True):
	#Delete old view
	try:
		record = storage.get('view.%s' % _id)
		if autorm:
			storage.remove(record)
		else:
			return record
	except:
		pass
		
	if not position:
		# fullscreen
		position = {'width': 1,'top': 0, 'left': 0, 'height': 1}
		
	logger.info(" + Create view '%s'" % name)
	record = crecord({'_id': 'view.%s' % _id }, type='view', name=name,group='group.CPS_view_admin')
	
	if  isinstance(data, list):
		record.data['items'] = data
	elif  isinstance(data, dict):
		record.data['items'] = [ {'position': position, 'data': data } ]
	else:
		raise("Invalide data ...")
		
	record.chmod(mod)
	storage.put(record)
	return record

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
	data = {'xtype': 'text', 'text': 'Welcome to Canopsis !'}
	create_view('_default_.dashboard', 'Dashboard', data)

	### Account
	data = { 'xtype': 'AccountGrid'}
	create_view('account_manager', 'Accounts', data)

	### Group
	data = { 'xtype': 'GroupGrid'}
	create_view('group_manager', 'Groups', data)

	### Components
	data = {'xtype': 'list', 'filter': '{"source_type":"component"}', 'show_resource': False}
	create_view('components', 'Components', data)

	### Resources
	data = { 'xtype': 'list', 'filter': '{"source_type":"resource"}'}
	create_view('resources', 'Resources', data)

	### View manager
	data = { 'xtype': 'ViewTreePanel'}
	create_view('view_manager', 'Views', data)

	###task
	data = { 'xtype': 'TaskGrid'}
	create_view('task_manager', 'Tasks', data)

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

def create_view(_id, name, data, position=None, mod='o+r'):
	#Delete old view
	try:
		record = storage.get('view.%s' % _id)
		storage.remove(record)
	except:
		pass
	if not position:
		# fullscreen
		position = {'width': 1,'top': 0, 'left': 0, 'height': 1}
		
	logger.info(" + Create view '%s'" % name)
	record = crecord({'_id': 'view.%s' % _id }, type='view', name=name)
	record.data['items'] = [ {'position': position, 'data': data } ]
	record.chmod(mod)
	storage.put(record)
	return record

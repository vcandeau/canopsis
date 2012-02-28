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
from cstorage import cstorage
from cselector import cselector
from crecord import crecord
from cconfig import cconfig

import logging
import time

##set root account
account1 = caccount(user="root", group="root")
account1.firstname = "Call-me"
account1.lastname = "God"
account1.passwd("root")

##get storage
storage = cstorage(account=account1, namespace='object')

## add root directory
record1 = crecord({'_id': 'directory.root','id': 'directory.root','expanded':'true'},type='view_directory', name="root directory")
storage.put(record1)

## add view manager
record1 = crecord({'_id': 'view.view_manager' }, type='view', name='Views')
record1.data['items'] = [ {'position': {'width': 1,'top': 0, 'left': 0, 'height': 1}, 'data':{ 'xtype': 'ViewTreePanel'},'id': 'widget-views'} ]
storage.put(record1)

##find all views
views = storage.find({'crecord_type':'view'}, account=account1)
for view in views:
	if view._id not in ['view._default_.dashboard','view.ComponentDetails','view.components','view.resources','view.group_manager','view.account_manager','view.view_manager']:
		##update all views
		print view._id
		view.leaf = True
		record1.add_children(view)
		storage.put(view)
storage.put(record1)
		





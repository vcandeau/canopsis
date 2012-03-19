/*
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
*/
Ext.define('canopsis.view.Task.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	alias: 'widget.TaskGrid',

	model: 'Task',
	store : 'Task',	

	
	opt_menu_delete: true,

	columns: [
	/*	{
			header: '',
			//width: 25,
			flex : 1,
			sortable: false,
			//renderer: rdr_crecord_type,
	        dataIndex: 'crecord_type',
		},*/{
			header: _('Name'),
			flex: 3,
			sortable: true,
			dataIndex: 'name',
		},{
			header: _('Function name'),
			flex: 3,
			sortable: true,
			dataIndex: 'task',
		},{
			header: _('Every'),
			flex: 1,
			sortable: true,
			dataIndex: 'crontab',
			renderer: rdr_task_timedelta,
		}
	],

	initComponent: function() {
		this.callParent(arguments);
	}

})

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
Ext.define('canopsis.view.Schedule.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	alias: 'widget.ScheduleGrid',

	model: 'Schedule',
	store : 'Schedules',	

	opt_db_namespace: 'object',
	
	opt_menu_delete: true,
	opt_menu_run_item : true,

	columns: [
		{
			header: _('Loaded'),
			width: 55,
			dataIndex: 'loaded',
			renderer: rdr_boolean
		},{
			header: _('Success'),
			width: 55,
			sortable: true,
			dataIndex: 'log_success',
			renderer: rdr_boolean
		},{
			header: _('Last execution'),
			flex: 1,
			sortable: true,
			dataIndex: 'log_last_execution',
			renderer: rdr_tstodate,
		},{
			header: _('Next execution'),
			flex: 1,
			sortable: true,
			dataIndex: 'next_run_time',
			renderer: rdr_utcToLocal,
		},{
			header: _('Schedule'),
			flex: 1,
			sortable: true,
			dataIndex: 'cron',
			renderer: rdr_task_crontab,
		},{
			header: _('Name'),
			flex: 2,
			sortable: true,
			dataIndex: 'crecord_name',
		},{
			header: _('Output'),
			flex: 5,
			sortable: true,
			dataIndex: 'log_output',

		},{
			header: _('Mailing'),
			width: 55,
			dataIndex: 'mail',
			renderer: rdr_boolean
		}
	],

	initComponent: function() {
		this.callParent(arguments);
	}

})

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
Ext.define('canopsis.view.Derogation.Grid' , {
	extend: 'canopsis.lib.view.cgrid',
	
	controllerId: 'Derogation',
	
	alias: 'widget.DerogationGrid',
	
	model: 'Derogation',
	store: 'Derogations',

	opt_paging: true,
	opt_menu_delete: true,
	opt_bar_duplicate: true,
	opt_menu_rights: true,
	opt_bar_search: true,

	columns: [
			{
				header: _('id'),
				flex: 1,
				dataIndex: '_id',
			},{
				header: _('Loaded'),
				flex: 1,
				dataIndex: 'loaded',
				renderer: rdr_boolean
			},{
				header: _('Enabled'),
				flex: 1,
				dataIndex: 'enabled',
				renderer: rdr_boolean
			},
			{
				header: _('Name'),
				flex: 1,
				dataIndex: 'crecord_name',
			},{
				header: _('comment'),
				sortable: false,
				flex: 1,
				dataIndex: 'output_tpl',
			},{
				header: _('Alert message'),
				sortable: false,
				flex: 1,
				dataIndex: 'alert_msg',
			},{
				header: _('Alert icon'),
				flex: 1,
				dataIndex: 'alert_icon',
			},{
				header: _('State'),
				flex: 1,
				dataIndex: 'state',
			},{
				header: _('Scope name'),
				flex: 1,
				dataIndex: 'scope_name',
			},{
				header: _('Start Timestamp'),
				flex: 1,
				dataIndex: 'startTs',
				renderer : rdr_tstodate
			},{
				header: _('Stop Timestamp'),
				flex: 1,
				dataIndex: 'stopTs',
				renderer : rdr_tstodate
			}
		]

});

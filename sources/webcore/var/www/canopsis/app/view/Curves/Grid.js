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
Ext.define('canopsis.view.Curves.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	controllerId: 'Curves',

	alias: 'widget.CurvesGrid',

	model: 'curve',
	store : 'Curve',

	opt_paging: false,
	opt_menu_delete: true,
	opt_bar_duplicate: true,
	opt_bar_search: true,
	opt_bar_search_field: [ 'metric' ],

	columns: [
		{
			header: _('L'),
			sortable: false,
			width: 25,
			dataIndex: 'line_color',
			renderer: rdr_color,
		},{
			header: _('A'),
			sortable: false,
			width: 25,
			dataIndex: 'area_color',
			renderer: rdr_color,
		},{
			header: _('O'),
			sortable: false,
			width: 25,
			dataIndex: 'area_opacity',
		},{
			header: _('Metric'),
			flex: 2,
			sortable: true,
			dataIndex: 'metric',
		}
            
	],

});

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
Ext.define('widgets.list.list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.list',
	
	//don't work
	filter: {"source_type":"component"},

	show_component: true,
	show_resource: true,

	initComponent: function() {
	
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title || this.fullmode) ? false : true,
			opt_paging: true,
			filter: this.filter,
			autoload: true,
			pageSize: global.pageSize,
			remoteSort: true,
			sorters: [{
				property : 'component',
				direction: 'ASC'
			},{
				property : 'resource',
				direction: 'ASC'
			}],

			opt_show_component: this.show_component,
			opt_show_resource: this.show_resource,
		
			opt_bar: true,
			opt_bar_search: true,
			opt_bar_search_field: ['component', 'resource'],

			opt_bar_add: false,
			opt_bar_duplicate: false,
			opt_bar_reload: true,
			opt_bar_delete: false,
			
			opt_view_element:'view.ComponentDetails'

		});

		// Bind buttons
		this.ctrl = Ext.create('canopsis.lib.controller.cgrid');
		this.on('afterrender', function() {
			this.ctrl._bindGridEvents(this.grid)
		}, this);

		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
});

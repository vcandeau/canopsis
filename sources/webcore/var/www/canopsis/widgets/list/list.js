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
	filter: {"source_type":"host"},

	initComponent: function() {
	
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title || this.fullmode) ? false : true,
			opt_paging: true,
			filter: this.filter,
			autoload: true,
			pageSize: global.pageSize,
			remoteSort: true,
			sorters: [{
				property : 'host_name',
				direction: 'ASC'
			},{
				property : 'service_description',
				direction: 'ASC'
			}],

			opt_show_host_name: true,
			opt_show_service_description: true,
			
			opt_tbar: true,
			opt_tbar_search: true,
			opt_tbar_search_field: ['host_name', 'service_description'],

			opt_tbar_add: false,
			opt_tbar_duplicate: false,
			opt_tbar_reload: true,
			opt_tbar_delete: false,
			
			opt_view_element : true,
			opt_view_element_name:'view.hostDetail'

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

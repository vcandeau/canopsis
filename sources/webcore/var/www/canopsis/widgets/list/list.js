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

	//Default options
	show_component: true,
	show_resource: true,
	show_state: true,
	show_state_type: true,
	show_source_type: true,
	show_last_check: true,
	show_output: true,
	
	paging: true,
	bar_search: true,
	reload: true,
	bar: true,
	hideHeaders: false,
	scroll: true,
	//..
	
	initComponent: function() {
		
		if (this.reload || this.bar_search) { this.bar = true } else { this.bar = false }
	
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			exportMode : this.exportMode,
			//border: (this.title || this.fullmode) ? false : true,
			opt_paging: this.paging,
			filter: this.filter,
			//autoload: true,
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
			opt_show_state: this.show_state,
			opt_show_state_type: this.show_state_type,
			opt_show_source_type: this.show_source_type,
			opt_show_last_check: this.show_last_check,
			opt_show_output: this.show_output,
		
			opt_bar: this.bar,
			opt_bar_search: this.bar_search,
			opt_bar_search_field: ['component', 'resource'],

			opt_bar_add: false,
			opt_bar_duplicate: false,
			opt_bar_reload: this.reload,
			opt_bar_delete: false,
			hideHeaders: this.hideHeaders,
			scroll: this.scroll 
			
			//opt_view_element:'view.ComponentDetails'

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
		
		this.ready();
	},
	
	doRefresh: function(from, to){
		if (this.grid)
			this.grid.store.load()
	},
	
});

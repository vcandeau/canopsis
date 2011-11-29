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
Ext.define('canopsis.lib.view.cgrid' ,{
	extend: 'Ext.grid.Panel',

	requires: [
		'Ext.grid.plugin.CellEditing',
		'Ext.form.field.Text',
		'Ext.toolbar.TextItem'
	],

	// Options
	opt_grouping: false,
	opt_paging: true,
	
	opt_tbar: true,
	opt_tbar_add:true,
	opt_tbar_duplicate: false,
	opt_tbar_reload:true,
	opt_tbar_delete:true,
	opt_tbar_search: false,
	opt_tbar_search_field: [],
	opt_tbar_time: false,
	
	opt_tbar_clock: true,

	opt_view_element : '',

	features: [],
	
	

	title : '',
	//iconCls: 'icon-grid',
	//frame: true,

	border: false,
	//selType: 'rowmodel',
	//plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
 
	initComponent: function() {
		/*if (this.opt_grouping){
			var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
				hideGroupedColumn: true,
				groupHeaderTpl: '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
			});
			this.features.push(groupingFeature);
		}*/


		//------------------Option docked bar--------------
		if (this.opt_tbar){
			var tbar_child = [];
		/*	var tbar_left = Ext.create('Ext.container.Container', {
				flex: 1.50,
				border: 0,
				items: []
			});
			var tbar_center = Ext.create('Ext.container.Container', {
				flex: 1,
				layout: 'hbox',
				items: []
			});;
			var tbar_right = Ext.create('Ext.container.Container', {
				flex: 1,
				layout : {
					type : 'hbox',
				},
				items: []
			});;
			*/
			if(this.opt_tbar_add){
				tbar_child.push({
					xtype: 'button',
					iconCls: 'icon-add',
					//cls: 'x-btn-default-toolbar-small',
					text: 'Add',
					action: 'add',
				})
			}
			if(this.opt_tbar_duplicate){
				tbar_child.push({
					xtype: 'button',
					iconCls: 'icon-copy', 
					text: 'Duplicate',
					action: 'duplicate',
				})
			}
			if(this.opt_tbar_reload){
				tbar_child.push({
					xtype: 'button',
					iconCls: 'icon-reload',
					text: 'Reload',
					action: 'reload',
				})
			}
			if(this.opt_tbar_delete){
				tbar_child.push({
					xtype: 'button',
					iconCls: 'icon-delete',
					text: 'Delete',
					disabled: true,
					action: 'delete',
				})
			}
			/*
			if(this.opt_tbar_clock){
				this.tbar_clock = Ext.create('Ext.toolbar.TextItem', {
					text: 'test',
					pack : 'center',
				})
				tbar_child.push(this.tbar_clock)
			}
			*/
			if(this.opt_tbar_search){
				tbar_child.push({xtype: 'tbfill'});
				tbar_child.push({
					xtype: 'textfield',
					name: 'searchField',
					hideLabel: true,
					width: 200,
					pack: 'end',
				})
				tbar_child.push({
					xtype : 'button',
					action: 'search',
					text: 'search',
					pack: 'end',
				})
			}
			
			//var tbar_child = [tbar_left,tbar_center,tbar_right];
			
			//creating toolbar
			this.tbar = Ext.create('Ext.toolbar.Toolbar', {
				items: tbar_child,
			});
			
		}
		

		
		//--------------------Paging toolbar -----------------
		if (this.opt_paging){
			this.pagingbar = Ext.create('Ext.PagingToolbar', {
				store: this.store,
				displayInfo: false,
				emptyMsg: "No topics to display",
			});
        
			this.bbar = this.pagingbar;
			this.bbar.items.items[10].hide();
			
		}
		
		//--------------------Context menu---------------------
		if (this.opt_tbar){
			var myArray = [];
			
			if(this.opt_tbar_delete){
				myArray.push(
					Ext.create('Ext.Action', {
						iconCls: 'icon-delete',
						text: 'Delete',
						action: 'delete',
					})
				)
			}
			if (this.opt_tbar_duplicate){
				myArray.push(
					Ext.create('Ext.Action', {
						iconCls: 'icon-copy',
						text: 'Duplicate',
						action: 'duplicate',
					})
				)
			}
			
			if (myArray.length != 0){
				this.contextMenu = Ext.create('Ext.menu.Menu',{
					items : myArray,
				});
			}
			
			
		}


		this.callParent(arguments);
	}

});

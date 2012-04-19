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
	
	opt_bar: true,
	opt_bar_bottom: false,
	opt_bar_add:true,
	opt_bar_download:false,
	opt_bar_duplicate: false,
	opt_bar_reload:true,
	opt_bar_delete:true,
	opt_bar_search: false,
	opt_bar_search_field: [],
	opt_bar_time: false,
	
	opt_db_namespace: 'object',
	
	opt_menu_rights: true,
	opt_menu_send_mail:false,
	
	opt_confirmation_delete: true,
	
	opt_keynav_del: undefined,

	opt_view_element : '',

	features: [],
	
	title : '',

	border: false,
	
	exportMode : false,
 
	initComponent: function() {
		/*if (this.opt_grouping){
			var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
				hideGroupedColumn: true,
				groupHeaderTpl: '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
			});
			this.features.push(groupingFeature);
		}*/
		
		// keynav_del
		if (this.opt_bar_delete && this.opt_keynav_del == undefined)
			this.opt_keynav_del = true

		// Set pageSize
		this.store.pageSize = global.accountCtrl.getConfig('pageSize')

		// Hack
		if (this.hideHeaders && this.border == false){
			this.bodyStyle = { 'border-width': 0 }
		}

		//------------------Option docked bar--------------
		if(this.exportMode){
			this.border = false
			//this.hideHeaders = true
		}else{
			if (this.opt_bar){
				var bar_child = [];

				if(this.opt_bar_add){
					bar_child.push({
						xtype: 'button',
						iconCls: 'icon-add',
						//cls: 'x-btn-default-toolbar-small',
						text: _('Add'),
						action: 'add',
					})
				}
				if(this.opt_bar_duplicate){
					bar_child.push({
						xtype: 'button',
						iconCls: 'icon-copy', 
						text: _('Duplicate'),
						action: 'duplicate',
					})
				}
				if(this.opt_bar_reload){
					bar_child.push({
						xtype: 'button',
						iconCls: 'icon-reload',
						text: _('Reload'),
						action: 'reload',
					})
				}
				if(this.opt_bar_delete){
					bar_child.push({
						xtype: 'button',
						iconCls: 'icon-delete',
						text: _('Delete'),
						disabled: true,
						action: 'delete',
					})
				}
				if(this.opt_bar_search){
					bar_child.push({xtype: 'tbfill'});
					bar_child.push({
						xtype: 'textfield',
						name: 'searchField',
						hideLabel: true,
						width: 200,
						pack: 'end',
					})
					bar_child.push({
						xtype : 'button',
						action: 'search',
						//text: _('Search'),
						iconCls: 'icon-search',
						pack: 'end',
					})
				}
				
				if(this.opt_bar_download){
					bar_child.push({
						xtype : 'button',
						//text: _('Download'),
						iconCls: 'icon-download',
						action: 'download',
					})
				}
				
				//creating toolbar
				if(this.opt_bar_bottom){
					this.bbar = Ext.create('Ext.toolbar.Toolbar', {
						items: bar_child,
					});
				}else{
					this.tbar = Ext.create('Ext.toolbar.Toolbar', {
						items: bar_child,
					});
				}
				
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
			if (this.opt_bar){
				var myArray = [];
				
				if(this.opt_bar_delete){
					myArray.push(
						Ext.create('Ext.Action', {
							iconCls: 'icon-delete',
							text: _('Delete'),
							action: 'delete',
						})
					)
				}
				if (this.opt_bar_duplicate){
					myArray.push(
						Ext.create('Ext.Action', {
							iconCls: 'icon-copy',
							text: _('Duplicate'),
							action: 'duplicate',
						})
					)
				}
				
				if(this.opt_menu_rights == true){
					myArray.push(
						Ext.create('Ext.Action', {
							iconCls: 'icon-access',
							text: _('Rights'),
							action: 'rights',
						})
					)
				}
				
				if(this.opt_menu_send_mail == true){
					myArray.push(
						Ext.create('Ext.Action', {
							//iconCls: 'icon-access',
							text: _('Send mail'),
							action: 'sendmail',
						})
					)
				}
				
				if (myArray.length != 0){
					this.contextMenu = Ext.create('Ext.menu.Menu',{
						items : myArray,
					});
				}
				
				
			}
		}

		this.callParent(arguments);
	}

});

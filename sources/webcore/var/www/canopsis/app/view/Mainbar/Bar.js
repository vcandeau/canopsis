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
Ext.define('canopsis.view.Mainbar.Bar' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.Mainbar',

	border: false,

	layout: {
		type: 'hbox',
		align: 'stretch',
		//padding: 5
	},

	baseCls: 'Mainbar',

	initComponent: function() {
		
		this.localeSelector = Ext.create('Ext.form.field.ComboBox', {
			id: 'localeSelector',
			action: 'localeSelector',
			queryMode: "local",
			displayField: "text",
			valueField: "value",
			fieldLabel: _("Language"),
			value: global.account['locale'],
			store: {
				xtype: "store",
				fields: ["value", "text"],
				data: [
						{"value": 'fr', "text": "Français"},
						{"value": 'en', "text": "English"},
				]
			},
			iconCls: 'no-icon',
			//iconCls:'icon-mainbar-edit-view',
		});
		
		this.viewSelector = Ext.create('Ext.form.field.ComboBox', {
			id: 'viewSelector',
			action: 'viewSelector',
			store:  Ext.create('canopsis.store.View', {autoLoad: false}),
			displayField: 'crecord_name',
			valueField: 'id',
			typeAhead: false,
			hideLabel: true,
			minChars: 2,
			queryMode: 'remote',
			emptyText: _('Select a view')+' ...',
			width: 200,
		});
		
		this.dashboardSelector = Ext.create('Ext.form.field.ComboBox', {
			iconCls: 'icon-mainbar-dashboard',
			id: 'dashboardSelector',
			action: 'dashboardSelector',
			store:  Ext.data.StoreManager.lookup('View'),
			displayField: 'crecord_name',
			valueField: 'id',
			typeAhead: true,
			//hideLabel: true,
			fieldLabel: _("Dashboard"),
			minChars: 2,
			queryMode: 'local',
			emptyText: _('Select a view')+' ...',
			value: global.account['dashboard'],
			width: 200,
			iconCls: 'no-icon'
			// Bug ...
			//iconCls: 'icon-mainbar-dashboard',
		});
		
		// Hide  menu when item are selected
		this.viewSelector.on('select',function(){
				var menu = this.down('menu[name="Run"]')
				menu.hide()
			},this)
			
		//Reporting menu
		if(global.reporting == true){
			reporting_menu =
				{
					iconCls: 'icon-mimetype-pdf',
					text: _('Export active view'),
					action: 'exportView'
				}
			
		} else {
			reporting_menu = []
		}
			
		//root build menu
		if(global.account.user == 'root'){
			var root_build_option = [
				{
					iconCls:'icon-mainbar-edit-account',
					text: _('Edit accounts'),
					action: 'editAccount'
				},{
					iconCls:'icon-mainbar-edit-group',
					text: _('Edit groups'),
					action: 'editGroup'
				}
			]
		} else {
			var root_build_option = []
		}
	
		this.items = [
			{
				iconCls: 'icon-mainbar-build',
				text: _('ITIL.Build'),
				menu: {
					items: [
							root_build_option,
							{
								iconCls:'icon-mainbar-edit-view',
								text: _('Edit active view'),
								action: 'editView'
							},{
								iconCls:'icon-mainbar-new-view',
								text: _('New view'),
								action: 'newView'
							}
					],
				}
			},{
				iconCls: 'icon-mainbar-run',
				text: _('ITIL.Run'),
				menu: {
					name: 'Run',
					showSeparator: true,
					items: [
							{
								iconCls: 'icon-mainbar-dashboard',
								text: _('Dashboard'),
								action: 'openDashboard'
							},{
								iconCls: 'icon-mainbar-viewdetails',
								text: _('Components'),
								action: 'openViewMenu',
								viewId: 'view.components'
							},{
								iconCls: 'icon-mainbar-viewdetails',
								text: _('Resources'),
								action: 'openViewMenu',
								viewId: 'view.resources'
							},{
								iconCls: 'icon-mainbar-run',
								text: _("Views manager"),
								action: 'openViewsManager'
							},'-', 
								this.viewSelector
					],
				}
			},{
				iconCls: 'icon-mainbar-report',
				text: _('ITIL.Report'),
				menu: {
					name: 'Report',
					showSeparator: true,
					items: [
							reporting_menu
					],
				}
			},'-',{
				xtype: 'container',
				html: "<div class='cps-title' >Canopsis</div>",
				flex : 1
			},/*{
				xtype : 'container',
				width : 300
			},*/{
				xtype : 'container',
				name : 'clock',
				align : 'strech',
				flex : 4
			},'->',{
				xtype: 'container',
				html: "<div class='cps-account' >"+global.account.firstname+" "+global.account.lastname+"</div>",
				flex:2.3
			},{
				iconCls: 'icon-user',
				flex : 0.2,
				menu: {
					items: [
						/*'-',
						{
							iconCls: 'icon-mainbar-dashboard',
							text: _('Language') + ":",
						},*/
						this.localeSelector,
						'-',
						/*{
							iconCls: 'icon-mainbar-dashboard',
							text: _('Dashboard') + ":",
						},*/
						this.dashboardSelector,
					]
				}

			},'-',{
				iconCls: 'icon-preferences',
				flex : 0.2,
				menu: {
					name: 'Preferences',
					showSeparator: true,
					items: [
							{
								iconCls: 'icon-console',
								text: _('Show log console'),
								action: 'showconsole'
							},{
								iconCls: 'icon-clear',
								text: _('Clear tabs cache'),
								action: 'cleartabscache'
							},'-',{
								iconCls: 'icon-logout',
								text: _('Logout'),
								action: 'logout'
							},
						],
				}
			}
		]
		this.callParent(arguments);
	}

});

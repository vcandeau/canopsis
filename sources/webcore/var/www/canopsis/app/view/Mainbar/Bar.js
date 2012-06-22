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
Ext.define('canopsis.view.Mainbar.Bar' , {
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.Mainbar',

	border: false,

	layout: {
		type: 'hbox',
		align: 'stretch'
		//padding: 5
	},

	baseCls: 'Mainbar',

	initComponent: function() {

		this.localeSelector = Ext.create('Ext.form.field.ComboBox', {
			id: 'localeSelector',
			action: 'localeSelector',
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			fieldLabel: _('Language'),
			value: global.locale,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data: [
						{'value': 'fr', 'text': 'Français'},
						{'value': 'en', 'text': 'English'}
						//{"value": 'ja', "text": "日本語"},
				]
			},
			iconCls: 'no-icon'
			//iconCls:'icon-mainbar-edit-view',
		});

		this.viewSelector = Ext.create('Ext.form.field.ComboBox', {
			id: 'viewSelector',
			action: 'viewSelector',
			store: Ext.create('canopsis.store.Views', {autoLoad: false}),
			displayField: 'crecord_name',
			valueField: 'id',
			typeAhead: false,
			hideLabel: true,
			minChars: 2,
			queryMode: 'remote',
			emptyText: _('Select a view') + ' ...',
			width: 200
		});

		this.dashboardSelector = Ext.create('Ext.form.field.ComboBox', {
			iconCls: 'icon-mainbar-dashboard',
			id: 'dashboardSelector',
			action: 'dashboardSelector',
			store: Ext.data.StoreManager.lookup('Views'),
			displayField: 'crecord_name',
			valueField: 'id',
			typeAhead: true,
			//hideLabel: true,
			fieldLabel: _('Dashboard'),
			minChars: 2,
			queryMode: 'local',
			emptyText: _('Select a view') + ' ...',
			value: global.account['dashboard'],
			width: 200,
			iconCls: 'no-icon'
			// Bug ...
			//iconCls: 'icon-mainbar-dashboard',
		});

		// Hide  menu when item are selected
		this.viewSelector.on('select', function() {
				var menu = this.down('menu[name="Run"]');
				menu.hide();
			},this);

		var menu_build = [];
		var menu_run = [];
		var menu_reporting = [];
		var menu_preferences = [];
		var menu_configuration = [];


		//Root build menu
		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_account_admin')){
			menu_build = menu_build.concat([
				{
					iconCls: 'icon-mainbar-edit-account',
					text: _('Edit accounts'),
					action: 'editAccount'
				},{
					iconCls: 'icon-mainbar-edit-group',
					text: _('Edit groups'),
					action: 'editGroup'
				}
			]);
		}

		//Build menu Curves Admin
		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_curve_admin')){
			menu_build = menu_build.concat([
				{
					iconCls: 'icon-mainbar-colors',
					text: _('Curves'),
					action: 'openViewMenu',
					viewId: 'view.curves'
				}
			]);
		}
		
		//Root selector menu
		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_selector_admin')){
			menu_build = menu_build.concat([
				{
					iconCls: 'icon-mainbar-selector',
					text: _('Edit selector'),
					action: 'editSelector'
				}
			]);
		}
		
		//Build menu
		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_view_admin')||global.accountCtrl.checkGroup('group.CPS_view')){
			menu_build = menu_build.concat([
				{
					iconCls: 'icon-mainbar-edit-view',
					text: _('Edit active view'),
					action: 'editView'
				},{
					iconCls: 'icon-mainbar-new-view',
					text: _('New view'),
					action: 'newView'
				}
			]);
		}

		//Reporting menu
		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_reporting_admin')){
			menu_reporting = menu_reporting.concat([
				{
					iconCls: 'icon-mimetype-pdf',
					text: _('Export active view'),
					action: 'exportView'
				}
			]);
		}


		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_schedule_admin')) {
			menu_reporting = menu_reporting.concat([
				{
					iconCls: 'icon-mainbar-add-task',
					text: _('Schedule active view export'),
					action: 'ScheduleExportView'
				},{
					iconCls: 'icon-mainbar-edit-task',
					text: _('Edit schedules'),
					action: 'editSchedule'
				}
			]);
		}

		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_reporting_admin')) {
			menu_reporting = menu_reporting.concat([{
					iconCls: 'icon-mainbar-reporting',
					text: _('Switch to live reporting'),
					action: 'reportingMode'
				}
			]);
		}

		menu_reporting = menu_reporting.concat([{
			iconCls: 'icon-mainbar-briefcase',
			text: _('Briefcase'),
			action: 'openBriefcase'
		}]);

		//Run menu
		menu_run = menu_run.concat([
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
			}
		]);

		if (global.accountCtrl.checkRoot() || global.accountCtrl.checkGroup('group.CPS_view_admin')||global.accountCtrl.checkGroup('group.CPS_view')){
			menu_run = menu_run.concat(
				[
					{
						iconCls: 'icon-mainbar-run',
						text: _('Views manager'),
						action: 'openViewsManager'
					}
				]
			);
		}

		menu_run = menu_run.concat([
			'-', this.viewSelector
		]);

		//Configuration menu
		menu_configuration = menu_configuration.concat([
			{
				iconCls: 'icon-console',
				text: _('Show log console'),
				action: 'showconsole'
			},{
				iconCls: 'icon-clear',
				text: _('Clear tabs cache'),
				action: 'cleartabscache'
			},{
				iconCls: 'icon-access',
				text: _('Authentification key'),
				action: 'authkey'
			},'-', {
				iconCls: 'icon-logout',
				text: _('Logout'),
				action: 'logout'
			}
		]);

		//Preferences menu
		menu_preferences = menu_preferences.concat([
			this.localeSelector,
			'-',
			this.dashboardSelector
		]);


		//Set Items
		this.items = [
			{
				iconCls: 'icon-mainbar-build',
				text: _('ITIL.Build'),
				menu: {
					items: menu_build
				}
			},{
				iconCls: 'icon-mainbar-run',
				text: _('ITIL.Run'),
				menu: {
					name: 'Run',
					showSeparator: true,
					items: menu_run
				}
			},{
				iconCls: 'icon-mainbar-report',
				text: _('ITIL.Report'),
				menu: {
					name: 'Report',
					showSeparator: true,
					items: menu_reporting
				}
			},'-', {
				//xtype: 'container',
				//html: "<div class='cps-title' >Canopsis</div>",
				xtype: 'tbtext',
				text: 'Canopsis',
				cls: 'cps-title',
				flex: 1
			},/*{
				xtype : 'container',
				width : 300
			},*/{
				xtype: 'container',
				name: 'clock',
				align: 'strech',
				flex: 4
			},'->', {
				xtype: 'container',
				html: "<div class='cps-account' >" + global.account.firstname + ' '+ global.account.lastname + '</div>',
				flex: 2.3
			},{
				iconCls: 'icon-user',
				flex: 0.2,
				menu: {
					items: menu_preferences
				}

			},'-', {
				iconCls: 'icon-preferences',
				flex: 0.2,
				menu: {
					name: 'Preferences',
					showSeparator: true,
					items: menu_configuration
				}
			},{
				iconCls: (global.websocketCtrl.connected) ? 'icon-bullet-green' : 'icon-bullet-red',
				id: 'Mainbar-menu-Websocket',
				flex: 0.2
				/*menu: {
					name: 'Websocket',
					showSeparator: true,
					items: menu_configuration
				}*/
			}
		];

		this.callParent(arguments);
	}

});

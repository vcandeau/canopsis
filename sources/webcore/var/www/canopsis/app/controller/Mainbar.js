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
Ext.define('canopsis.controller.Mainbar', {
	extend: 'Ext.app.Controller',

	views: [ 'Mainbar.Bar'],

	logAuthor: '[controller][Mainbar]',

	init: function() {
		this.control({
			'#region-north' : {
				collapse : this.onCollapseMainbar,
				expand: this.onExpandMainbar,
			},
			'Mainbar menuitem[action="logout"]' : {
				click : this.logout,
			},
			'Mainbar menuitem[action="cleartabscache"]' : {
				click : this.cleartabscache,
			},
			'Mainbar combobox[action="viewSelector"]' : {
				select : this.openViewSelector,
			},
			'Mainbar combobox[action="dashboardSelector"]' : {
				select : this.setDashboard,
			},
			'Mainbar combobox[action="localeSelector"]' : {
				select : this.setLocale,
			},
			'Mainbar menuitem[action="openDashboard"]' : {
				click : this.openDashboard,
			},
			'Mainbar menuitem[action="editView"]' : {
				click : this.editView,
			},
			'Mainbar menuitem[action="editAccount"]' : {
				click : this.openAccount,
			},
			'Mainbar menuitem[action="showconsole"]' : {
				click : this.showconsole,
			},
			'Mainbar menuitem[action="openViewsManager"]' : {
				click : this.openViewsManager,
			},
			'Mainbar menuitem[action="editGroup"]' : {
				click : this.openGroup,
			},
			'Mainbar menuitem[action="editTask"]' : {
				click : this.editTask,
			},
			'Mainbar menuitem[action="openBriefcase"]' : {
				click : this.openBriefcase,
			},
			'Mainbar menuitem[action="newView"]' : {
				click : this.newView,
			},
			'Mainbar menuitem[action="exportView"]' : {
				click : this.exportView,
			},
			'Mainbar menuitem[action="reportingMode"]' : {
				click : this.reportingMode,
			},
			'Mainbar [name="clock"]' : {
				afterrender : this.setClock,
			},
			'Mainbar menuitem[action="openViewMenu"]' : {
				click : this.openViewMenu,
			},
			
		})

		this.callParent(arguments);
	},

	onCollapseMainbar: function(){
	},
	
	onExpandMainbar: function(){
	},

	logout: function(){
		log.debug('Logout', this.logAuthor)
		Ext.Ajax.request({
			url: '/logout',
			scope: this,
			success: function(response){
				log.debug(' + Success.', this.logAuthor);
				window.location.href='/';
			},
			failure: function ( result, request) {
				log.error("Logout impossible, maybe you're already logout")
			}
		});
	},

	cleartabscache: function(){
		log.debug('Clear tabs localstore', this.logAuthor);
		var store = Ext.data.StoreManager.lookup('Tabs');
		store.proxy.clear();
	},

	showconsole: function(){
		log.debug('Show log console', this.logAuthor);
		log.show_console();
	},
	
	openViewMenu: function(item){
		var view_id = item.viewId
		this.getController('Tabs').open_view({ view_id: view_id, title: _(item.text) })
	},
	
	setClock : function(item){
		log.debug('Set Clock', this.logAuthor);
		var refreshClock = function(){
			var thisTime = new Date()
			hours = thisTime.getHours();
			minutesRaw = thisTime.getMinutes();
			//add 0 if needed
			if(minutesRaw < 10){
				var minutes = "0" + minutesRaw;
			}else{
				var minutes = minutesRaw
			}
			
			item.update("<div class='cps-account' >" + hours + ":" + minutes + "  -  " + (thisTime.toLocaleDateString()) + "</div>");
		};
		Ext.TaskManager.start({
			run: refreshClock,
			interval: 60000
		});
	},
	
	setLocale: function(combo, records){
		var language = records[0].get('value');
		log.debug('Set language to '+language, this.logAuthor);
		this.getController('Account').setLocale(language)
	},

	setDashboard: function(combo, records){
		var view_id = records[0].get('id');
		log.debug('Set dashboard to '+view_id, this.logAuthor);
		
		//set new dashboard
		this.getController('Account').setConfig("dashboard", view_id);
		
		var maintabs = Ext.getCmp('main-tabs');
		
		//close view selected if open
		var tab = Ext.getCmp(view_id+".tab");
		if (tab){
			tab.close()
		}
		
		//close current dashboard
		
		maintabs.setActiveTab(0)
		maintabs.getActiveTab().close()
		var tab = this.getController('Tabs').open_dashboard()
	
	},
	
	openDashboard: function(){
		log.debug('Open dashboard', this.logAuthor);
		var maintabs = Ext.getCmp('main-tabs');
		maintabs.setActiveTab(0);
	},

	openViewSelector: function(combo, records){
		var view_id = records[0].get('id');
		var view_name = records[0].get('crecord_name');
		log.debug('Open view "'+view_name+'" ('+view_id+')', this.logAuthor);
		combo.clearValue();
		this.getController('Tabs').open_view({ view_id: view_id, title: view_name })
	},
	
	openViewsManager: function(){
		this.getController('Tabs').open_view({ view_id: 'view.view_manager', title: _('Views') })
	},
	
	openAccount: function(){
		this.getController('Tabs').open_view({ view_id: 'view.account_manager', title: _('Accounts') })
	},
	
	openGroup: function(){
		this.getController('Tabs').open_view({ view_id: 'view.group_manager', title: _('Groups') })
	},
	
	editView: function(){
		log.debug('Edit view', this.logAuthor);
		var ctrl = this.getController('Tabs')
		ctrl.edit_active_view()
	},
	
	editTask : function(){
		this.getController('Tabs').open_view({ view_id: 'view.task_manager', title: _('Tasks') })
	},
	
	openBriefcase : function(){
		this.getController('Tabs').open_view({ view_id: 'view.briefcase', title: _('Briefcase') })
	},
	
	reportingMode: function(){
		log.debug('Live reporting mode activated', this.logAuthor);
		var ctrl = this.getController('ReportingBar')
		ctrl.enable_reporting_mode()
	},
	
	newView: function(){
		log.debug('New view', this.logAuthor);
		var ctrl = this.getController('Tabs')
		ctrl.create_new_view()
	},
	
	exportView: function(id){
		var view_id = Ext.getCmp('main-tabs').getActiveTab().view_id		
		this.getController('Reporting').launchReport(view_id)
	},
});

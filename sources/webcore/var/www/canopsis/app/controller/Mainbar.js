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
			'Mainbar menuitem[action="logout"]' : {
				click : this.logout,
			},
			'Mainbar menuitem[action="cleartabscache"]' : {
				click : this.cleartabscache,
			},
			'Mainbar combobox[action="viewSelector"]' : {
				select : this.openView,
			},
			'Mainbar menuitem[action="openDashboard"]' : {
				click : this.openDashboard,
			},
			'Mainbar menuitem[action="editView"]' : {
				click : this.editView,
			},
			'Mainbar menuitem[action="newView"]' : {
				click : this.newView,
			},
			'Mainbar menuitem[action="showconsole"]' : {
				click : this.showconsole,
			},
			'Mainbar [name="clock"]' : {
				afterrender : this.setClock,
			},
		})

		//Set clock
		//this.setClock();

		this.callParent(arguments);
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

	openDashboard: function(){
		log.debug('Open dashboard', this.logAuthor);
		var maintabs = Ext.getCmp('main-tabs');
		maintabs.setActiveTab(0);
	},

	openView: function(combo, records){
		var vid = records[0].get('id');
		var vtitle = records[0].get('crecord_name');
		log.debug('Open view '+vid, this.logAuthor);
		combo.clearValue();
		console.log(combo)
		add_view_tab(vid, vtitle, true, {}, true, true);
	},
	
	editView: function(){
		log.debug('Edit view', this.logAuthor);
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.jqgridable.editMode();
	},
	
	newView: function(){
		log.debug('New view', this.logAuthor);
		Ext.Msg.prompt(_('View name'), _('Please enter view name:'), function(btn, text){
			if (btn == 'ok'){
				log.dump(text)
				tab = add_view_tab(undefined, text, true, {viewName : text}, true, false, false)
				tab.jqgridable.editMode();
			} else {
				log.debug('cancel new view')
			}
		});
	},
});

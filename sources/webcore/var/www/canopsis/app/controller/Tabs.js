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
Ext.define('canopsis.controller.Tabs', {
	extend: 'Ext.app.Controller',

	logAuthor: '[controller][tabs]',

	stores: ['Tabs'],
	views: ['Tabs.View', 'Tabs.Content'],

	init: function() {
		this.control({
			'tabpanel': {
				tabchange: this.on_tabchange,
				//add: this.on_add,
				//remove: this.on_remove
			},
		});

		var store = Ext.data.StoreManager.lookup('Tabs');
		store.proxy.id = store.proxy.id + '.' + global.account.user
		store.load();
	},

  	on_tabchange: function(tabPanel, new_tab, old_tab, object){
		//log.debug('Tabchange', this.logAuthor);
		tabPanel.old_tab = old_tab
	},
	
	reload_active_view: function(){
		log.debug('Reload active view', this.logAuthor)
		var tab = Ext.getCmp('main-tabs').getActiveTab();
		tab.removeAll()
		tab.displayed = false
		tab.setContent()
	},
	
	create_new_view : function(){
		Ext.Msg.prompt(_('View name'), _('Please enter view name:'), function(btn, viewName){
			if (btn == 'ok'){
				//create view 
				var store = Ext.data.StoreManager.lookup('View')
				var treeStore = Ext.data.StoreManager.lookup('TreeStoreView')
				var record = Ext.create('canopsis.model.view', data)
				
				var view_id = 'view.'+ global.account.user + '.' + global.gen_id()
				
				//check if view already exist
				var already_exist = store.findBy(
						function(storeRecord, id){
								if(storeRecord.get('crecord_name') == viewName){
									return true;  // a record with this data exists
								}
					}, this);

				if(already_exist != -1){
					Ext.Msg.alert(_('this view already exist'), _("you can't add the same view twice"));
				} else {
					record.set('crecord_name',viewName)
					record.set('leaf', true)
					record.set('id', view_id)
					
					treeStore.load()
					
					var rootNode = treeStore.getRootNode()
					log.debug('rootNode Id is : ' + rootNode.get('id'),this.logAuthor)
					log.debug('record Id is : ' + record.get('id'),this.logAuthor)
					
					rootNode.appendChild(record)
					rootNode.dirty = false
					
					treeStore.sync()

					//open view
					tab = add_view_tab(view_id, viewName, true, undefined, true, true, false)
					tab.editMode();
					
					//refresh stores
					store.load()
					treeStore.load()
				}

			} else {
				log.debug('cancel new view',this.logAuthor)
			}
		});
	},
  	/*on_add: function(component, index, object){
		log.debug('Added', this.logAuthor);	
	},

	on_remove: function(component, object){
		log.debug('Removed', this.logAuthor);
	}*/

});

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
function init_REST_Store(collection, selector, groupField){
	var options = {}
	log.debug("Init REST Store, Collection: '"+collection+"', selector: '"+selector+"', groupField: '"+groupField+"'")
	
	options['storeId'] = collection+selector
	options['id'] = collection+selector
	//options['model'] = Ext.create('canopsis.model.'+collection)
	//options['model'] = 'canopsis.model.'+collection
	options['model'] = Ext.ModelMgr.getModel('canopsis.model.'+collection)
	if (groupField){
		options['groupField'] = groupField
	}
	
	var store = Ext.create('canopsis.store.Mongo-REST', options)
	store.proxy.url = '/webservices/rest/'+collection+'/'+selector

	return store
}

function load_tabs_from_store(){
	var store = Ext.data.StoreManager.lookup('Tabs');
	//store.on('load', function(){
	
	log.debug('Parse tabs store ...');
	store.each(function(record) {
		var view_id = record.get('view_id');
		var options = record.get('options');
		var title = record.get('title');
		var closable = record.get('closable');

		log.debug(' + Id: '+record.id);
		log.debug('   + Title: '+title);
		log.debug('   + Closable: '+closable);
		log.debug('   + View_id: '+view_id);
		log.debug('   + Options: '+options);

		var tab = add_view_tab(view_id, title, closable, options, false, false)
		tab.localstore_record = record
	})

	//}, this);
}

function add_view_tab(view_id, title, closable, options, autoshow, save, tab_id){
	log.debug("Add view tab '"+view_id+"'")

	var maintabs = Ext.getCmp('main-tabs');
	if(tab_id){
		var tab_id = view_id+ tab_id +'.tab'
	} else {
		var tab_id = view_id +'.tab'
	}
	var tab = Ext.getCmp(tab_id);

	//if (! closable) { closable = true }
	//if (! autoshow) { autoshow = true }
	//if (! save) { save = true }
	
	//log.debug(record.data)
	if (tab) {
		log.debug(" - Tab allerady open, just show it")
		maintabs.setActiveTab(tab);
	}else{
		log.debug(" - Create tab ...")
		log.debug("    - Get view config ("+view_id+") ...")
		
		var localstore_record = false;
		if (save){
			// archive tab in store
			log.debug("Add '"+title+"' ('"+view_id+"') in localstore ...")
			var store = Ext.data.StoreManager.lookup('Tabs');
			localstore_record = store.add({ title: title, closable: closable, options: options, view_id: view_id });
			store.save();
		}

		var tab = maintabs.add({
			title: title,
			id: tab_id,
			iconCls: [ 'icon-bullet-orange' ],
			view_id: view_id,
			//view: view,
			xtype: 'TabsContent',
			closable: closable,
			options: options,
			autoshow: autoshow,
			localstore_record: localstore_record
		});

		if (autoshow) {
			tab.show();
		}

		return tab;
	}
}

var random_id = function () { return Math.floor(Math.random()*11)}

function show_dashboard(){
	log.dump("Get my dashboard ...")
	Ext.Ajax.request({
		url: '/ui/dashboard',
		success: function(response){
			data = Ext.JSON.decode(response.responseText)
			data = data.data[0]
			add_view_tab(data._id, 'Dashboard', false, {}, true, false)
			load_tabs_from_store()
		},
		failure: function (result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
		} 
	});
}


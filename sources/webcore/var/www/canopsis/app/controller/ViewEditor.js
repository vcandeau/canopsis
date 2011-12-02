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
Ext.define('canopsis.controller.ViewEditor', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['ViewEditor.View', 'ViewEditor.Form'],
	stores: ['View', 'Widget'],
	models: ['view', 'widget'],

	iconCls: 'icon-crecord_type-view',

	init: function() {
		log.debug('['+this.id+'] - Initialize ...');

		this.formXtype = 'ConfigView'
		this.listXtype = 'ViewEditor'

		this.modelId = 'view'

		this.callParent(arguments);
	},
	
	_saveForm : function(form){
		if (form.GlobalOptions.getForm().isValid()){
		
			var store = this.grid.store;
			var record = Ext.create('canopsis.model.view', data);
			
			log.debug('[controller][cgrid][form] - Saving form');
			
			//parsing items
			var temptab = [];
			
			form.ItemsStore.each(function(record) {
				temptab.push(record.data);
			});
			record.set('items', temptab);
			
			//crecord_name and name fixing
			var record_name = form.down('textfield[name=crecord_name]').getValue()
			record.set('crecord_name',record_name);
			//log.debug('crecord_name : ' + record.get('crecord_name'));
			if (form.recordName){
				record.set('id',form.recordName);
			} else {
				record.set('id','view.'+ global.account.user + '.' + record_name);
			}
			//log.debug('id : ' + record.get('id'));
			record.set('refreshInterval',form.down('numberfield[name=refreshInterval]').getValue());
			//log.debug('refreshInterval : ' + record.get('refreshInterval'));
			record.set('nbColumns',form.down('numberfield[name=nbColumns]').getValue());
			//log.debug('nbColumns : ' + record.get('nbColumns'));
			record.set('rowHeight',form.down('numberfield[name=rowHeight]').getValue());
			//log.debug('rowHeight : ' + record.get('rowHeight'));
			
			
			//get nodeId if defined
			//panel = form.GlobalOptions.down('gridpanel');
			_nodeId = form.globalNodeId.getStore().getAt(0);
			//log.debug(_nodeId);
			if (_nodeId){
				log.debug('there is a nodeId :');
				log.debug(_nodeId.get('id'));
				record.set('nodeId', _nodeId.get('id'));
			}
			
			log.debug('[controller][cgrid][form] - Store record in store');
			log.debug(record);
			output = store.add(record);
			log.debug('this record have added to store(what add() have returned) :')
			log.debug(output);
			
			var dtask = new Ext.util.DelayedTask(function(){
				this.grid.store.load();
			},this);
			dtask.delay(500);
			
			//store.load();
			
			//reload menu view
			Ext.data.StoreManager.lookup('Menu').load();
			
			
			this._cancelForm(form);
		}
	},

	beforeload_EditForm: function(form){
		var user_textfield = form.GlobalOptions.down('textfield[name=crecord_name]')
		if (user_textfield){
			user_textfield.disable();
		}
	},
	
	deleteButton: function(){
		//reload menu view
		Ext.data.StoreManager.lookup('Menu').load();
	},

	afterload_EditForm: function(form){
		if (form.nodeId){
			var cinventory = form.GlobalOptions.down('panel');
			tab = []
			tab.push(form.nodeId);
			cinventory.LoadStore(tab);
		}
		
	},
	
	afterload_DuplicateForm: function(form){
		if (form.nodeId){
			var cinventory = form.GlobalOptions.down('panel');
			tab = []
			tab.push(form.nodeId);
			cinventory.LoadStore(tab);
			form.GlobalOptions.down('textfield[name=crecord_name]').setValue('');
		}
		
	}


});

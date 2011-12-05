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
Ext.define('canopsis.lib.controller.cgrid', {
	extend: 'Ext.app.Controller',

	init: function() {
		log.debug('[controller][cgrid] - '+this.id+' Initialize ...');

		var control = {}
		control[this.listXtype] = {
		                afterrender: this._bindGridEvents
		}
		this.control(control);

		this.callParent(arguments);

	},
   
	_bindGridEvents: function(grid) {
		var id = grid.id
		this.grid = grid
		

		log.debug('[controller][cgrid] - Bind events "'+id+'" ...')

		grid.on('selectionchange',	this._selectionchange,	this)
		if(grid.opt_view_element){
			grid.on('itemdblclick',this._viewElement,this)
		}
		else{
			grid.on('itemdblclick',this._editRecord,this)
		}
		
		
		//Binding action for contextMenu
		if(grid.contextMenu){
			grid.on('itemcontextmenu', this._contextMenu)
			
			//Duplicate button
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=duplicate]')
			for (i in btns){
				btns[i].on('click', this._duplicateRecord, this)
			}
			//DeleteButton
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=delete]')
			for (i in btns){
				btns[i].on('click', this._deleteButton, this)
			}
			
		}
		/*
		//clock system
		if(grid.tbar_clock){
			var refreshClock = function(){
				var thisTime = new Date()
				grid.tbar_clock.update(thisTime.getHours()+ ":" + thisTime.getMinutes() + "  -  " + (thisTime.toLocaleDateString()));
			};
			Ext.TaskManager.start({
				run: refreshClock,
				interval: 1000000
			});
		}
		*/
		//search buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=search]')
		for (i in btns){
			btns[i].on('click', this._searchRecord, this)
		}
		
		//bind keynav
		var textfields = Ext.ComponentQuery.query('#' + id + ' textfield[name=searchField]')
		for (i in textfields){
				var textfield = textfields[i];
				Ext.create('Ext.util.KeyNav', textfield.id, {
					scope: this,
					enter: this._searchRecord
				});
		}

		if(grid.opt_keynav_del){
			Ext.create('Ext.util.KeyNav', id, {
						scope: this,
						del: this._deleteButton
			});
		}
		
		//Duplicate buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=duplicate]')
		for (i in btns){
			btns[i].on('click', this._duplicateRecord, this)
		}

		// Add buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=add]')
		for (i in btns){
			btns[i].on('click', this._addButton, this)
		}

		// Delete buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=delete]')
		for (i in btns){
			btns[i].on('click', this._deleteButton, this)
		}

		// Reload buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=reload]')
		for (i in btns){
			btns[i].on('click', this._reloadButton, this)
		}

		//this._reloadButton(grid)
		
	},

	_bindFormEvents: function(form) {
		var id = form.id
		log.debug('[controller][cgrid][form] - Bind events on "'+id+'" ...')

		// Save buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=save]')
		for (i in btns){
			btns[i].on('click', function(){ this._saveForm(form) }, this)
		}

		// Cancel buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=cancel]')
		for (i in btns){
			btns[i].on('click', function(){ this._cancelForm(form) }, this)
		}
	},

	_reloadButton: function() {
		log.debug('[controller][cgrid] - Reload store "'+this.grid.store.storeId+'" of '+this.grid.id);
		log.dump(this.grid.store.proxy.extraParams.filter)
		this.grid.store.load()
	},

	_selectionchange: function(view, records){
		log.debug('[controller][cgrid] - selectionchange');
		var grid = this.grid

		//Enable delete Button
		btns = Ext.ComponentQuery.query('#' + grid.id + ' button[action=delete]')
		for (i in btns){
			btns[i].setDisabled(records.length === 0);
		}

		if (this.selectionchange) {
			this.selectionchange(view, records)
		}
	},
	
	_viewElement: function(view, item, index){
		log.debug('[controller][cgrid] - clicked on element, function viewElement');
		add_view_tab(this.grid.opt_view_element, item.data.host_name, true, {'nodeId' : item.data._id}, true, true,item.data.host_name)
	},

	_deleteButton: function(button) {
		log.debug('[controller][cgrid] - clicked deleteButton');
		var grid = this.grid

		var selection = grid.getSelectionModel().getSelection();
		if (selection) {
			log.debug("[controller][cgrid] - Remove record ...")
			grid.store.remove(selection);
		}

		if (this.deleteButton) {
			this.deleteButton(button, grid, selection);
		}
	},

	_addButton: function(button) {
		log.debug('[controller][cgrid] - clicked addButton');

		if (this.formXtype) {
			var main_tabs = Ext.getCmp('main-tabs')

			log.debug("[controller][cgrid] - Create tab '"+this.formXtype+"'")
			var form = main_tabs.add({
				title: '* New '+this.modelId,
				xtype: this.formXtype,
				closable: true,}).show();
			
			this._bindFormEvents(form)
				
		}

		if (this.addButton) {
			this.addButton(button)
		}
		
	},
	
	_saveForm: function(form) {
		log.debug('[controller][cgrid][form] - clicked saveForm');

		var store = this.grid.store;

		if (form.form.isValid()){
			var data = form.getValues();
			if (this._validateForm(store, data, form.form)) {
				log.debug('[controller][cgrid][form] - Form is conform');
				var record = Ext.create('canopsis.model.'+this.modelId, data);
				log.debug('[controller][cgrid][form] - Store record in store');
				record = this._preSave(record)
				store.add(record);
				this._postSave(record)
				log.debug('[controller][cgrid][form] - Reload store');
				store.load();

				this._cancelForm(form);


			}else{
				log.debug('[controller][cgrid][form] - Form is not valid !');
			}
		}else{
			log.debug('[controller][cgrid][form] - Form is not valid !');
		}

		if (this.saveForm) {
			this.saveForm(form)
		}
			
	},
	
	_validateForm: function(store, data, form) {
		if (this.validateForm){
			return this.validateForm(store, data, form);
		}else{
			return true;
		}
	},

	_preSave: function(record){
		log.debug('[controller][cgrid][form] - Pre-Save');
		if (this.preSave){
			return this.preSave(record)
		}else{
			return record
		}
	},

	_postSave: function(record){
		log.debug('[controller][cgrid][form] - Post-Save');
		if (this.postSave){
			return this.postSave(record)
		}else{
			return record
		}
	},

	_cancelForm : function(form) {
		log.debug('[controller][cgrid][form] - clicked cancelForm');
		if (this.formXtype) {
			var id = form.id
			log.debug("[controller][cgrid][form] - Close '"+id+"'");
			form.close()
		}

		if (this.cancelForm) {
			this.cancelForm(form)
		}
	},

	_editRecord: function(view, item, index) {
		log.debug('[controller][cgrid] - clicked editRecord');

		if (this.formXtype) {
			var main_tabs = Ext.getCmp('main-tabs')
			var id = this.formXtype + '-' + item.internalId.replace(/[\. ]/g,'-') + '-tab'
			var tab = Ext.getCmp(id);
			if (tab) {
				log.debug("[controller][cgrid] - Tab '"+id+"'allerady open, just show it")
				main_tabs.setActiveTab(tab);
			}else{
				log.debug("[controller][cgrid] - Create tab '"+id+"'")
				var form = main_tabs.add({
					title: 'Edit '+item.raw.crecord_name,
					recordName: item.internalId,
					xtype: this.formXtype,
					editing: true,
					id: id,
					closable: true,}).show();
				

				if (this.beforeload_EditForm) {
					this.beforeload_EditForm(form)
				}

				form.loadRecord(item);

				if (this.afterload_EditForm) {
					this.afterload_EditForm(form)
				}

				this._bindFormEvents(form)

			}
		}	
		
		if (this.editRecord) {
			this.editRecord(view, item, index)
		}
	},
	
	_contextMenu : function(view, rec, node, index, e) {
		e.stopEvent();
		this.contextMenu.showAt(e.getXY());
		return false;
    },
	
	_duplicateRecord: function() {
		log.debug('[controller][cgrid] - clicked duplicateRecord');
		grid = this.grid;
		item = grid.getSelectionModel().getSelection()[0];

		if (this.formXtype) {
			var main_tabs = Ext.getCmp('main-tabs')
			var id = this.formXtype + '-' + item.internalId.replace(/[\. ]/g,'-') + '-tab'
			var tab = Ext.getCmp(id);
			if (tab) {
				log.debug("[controller][cgrid] - Tab '"+id+"'allerady open, just show it")
				main_tabs.setActiveTab(tab);
			}else{
				log.debug("[controller][cgrid] - Create tab '"+id+"'")
				var form = main_tabs.add({
					title: 'Edit '+item.raw.crecord_name,
					xtype: this.formXtype,
					id: id,
					closable: true,}).show();
				

				if (this.beforeload_DuplicateForm) {
					this.beforeload_DuplicateForm(form)
				}

				form.loadRecord(item);

				if (this.afterload_DuplicateForm) {
					this.afterload_DuplicateForm(form)
				}

				this._bindFormEvents(form)

			}
		}
	},
	
	_searchRecord : function(){
		log.debug('[controller][cgrid] - clicked on searchButton');
		var grid = this.grid;
		var store = grid.getStore();
		var search = grid.down('textfield[name=searchField]').getValue();
		
		//create an array and give it to store.search
		var myArray = []
		for (i in grid.opt_tbar_search_field){
			var tempObj = {}
			tempObj[grid.opt_tbar_search_field[i]] = { "$regex" : ".*"+search+".*", "$options" : "i"};
			myArray.push(tempObj);
		}
		store.search(store.getOrFilter(myArray));
		grid.pagingbar.moveFirst();
	}
	
});

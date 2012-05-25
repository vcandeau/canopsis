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

	allowEdit: true,
	
	EditMethod: "window",
	
	logAuthor : '[controller][cgrid]',

	init: function() {
		log.debug('Initialize '+this.id+' ...',this.logAuthor);

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
		

		log.debug('Bind events "'+id+'" ...',this.logAuthor)

		//Bind Dblclick
		grid.on('selectionchange',	this._selectionchange,	this)
		if(grid.opt_view_element){
			grid.on('itemdblclick',this._viewElement,this)
		}
		else{
			if(grid.opt_allow_edit == true)
				grid.on('itemdblclick',this._editRecord,this)
		}
		
		
		//Binding action for contextMenu
		if(grid.contextMenu){
			grid.on('itemcontextmenu', this._contextMenu,this)
			
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
			
			//edit rights
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=rights]')
			for (i in btns){
				btns[i].on('click', this._editRights, this)
			}
			
			//Rename option
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=rename]')
			for (i in btns){
				btns[i].on('click', this._rename, this)
			}
			
			//send by mail
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=sendByMail]')
			for (i in btns){
				btns[i].on('click', this._sendByMail, this)
			}
			
			//authKey
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=authkey]')
			for (i in btns){
				btns[i].on('click', this._authkey, this)
			}
			
			var btns = Ext.ComponentQuery.query('#' + grid.contextMenu.id + ' [action=run]')
			for (i in btns){
				btns[i].on('click', this._runItem, this)
			}
			
		}
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
			//log.debug('id of grid is : ' + id);
			this._keynav = Ext.create('Ext.util.KeyNav', id, {
						scope: this,
						del: this._deleteButton,
						target: id
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
		
		// Download buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=download]')
		for (i in btns){
			btns[i].on('click', this._downloadButton, this)
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
		log.debug('Reload store "'+this.grid.store.storeId+'" of '+this.grid.id ,this.logAuthor);
		log.debug('store.proxy.extraParams.filter:',this.logAuthor)
		log.dump(this.grid.store.proxy.extraParams.filter)
		this.grid.store.load()
	},

	_selectionchange: function(view, records){
		log.debug('selectionchange',this.logAuthor);
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
		log.debug('Clicked on element, function viewElement',this.logAuthor);
		//add_view_tab(this.grid.opt_view_element, item.data.component, true, {'nodeId' : item.data._id}, true, true,item.data.component)
	},

	_deleteButton: function(button) {
		log.debug('Clicked deleteButton',this.logAuthor);
		var grid = this.grid

		var selection = grid.getSelectionModel().getSelection();
		if (selection) {
			
			//check right
			var ctrlAccount = this.getController('Account')
			var authorized = true
			for(var i in selection)
				if(!ctrlAccount.check_record_right(selection[i],'w'))
					authorized = false
			
			
			if(authorized == true){
				log.debug("Remove record ...",this.logAuthor)
				Ext.MessageBox.confirm(_('Confirm'), _('Are you sure you want to delete') +' '+ selection.length + ' ' + _('items') + ' ?',
					function(btn, text){
						if (btn == 'yes'){
							//grid.store.suspendEvents()
							grid.store.remove(selection)
							log.debug('Reload store',this.logAuthor);
							//grid.store.sync()
							//grid.store.resumeEvents()
							//grid.store.load()
						}
					});
			} else {
				global.notify.notify(_('Access denied'),_('You don\'t have the rights to modify this object'),'error')
			}
		}

		if (this.deleteButton) {
			this.deleteButton(button, grid, selection);
		}
		
		
	},
	
	_editRights: function(){
		//log.debug('Edit rights',this.logAuthor);
		var grid = this.grid
		var selection = grid.getSelectionModel().getSelection()[0];
		//create form
		if(this.getController('Account').check_record_right(selection,'w')){
			var config = {
				data:selection,
				namespace:this.grid.opt_db_namespace,
				renderTo : grid.id,
				constrain: true
			}
			crights = Ext.create('canopsis.lib.view.crights',config)
			//listen to save event to refresh store
			crights.on('save', function(){grid.store.load()},this)
			crights.show()
		} else {
			global.notify.notify(_('Access denied'),_('You don\'t have the rights to modify this object'),'error')
		}
	},

	_addButton: function(button) {
		log.debug('Clicked addButton',this.logAuthor);

		this._showForm()

		if (this.addButton)
			this.addButton(button)
	},
	
	_saveForm: function(form,store) {
		log.debug('Clicked saveForm',this.logAuthor);

		if(store == undefined){
			var store = this.grid.store;
		}

		if (form.form.isValid()){
			var data = form.getValues();
			if (this._validateForm(store, data, form.form)) {
				log.debug('Form is conform',this.logAuthor);
				var record = Ext.create('canopsis.model.'+this.modelId, data);
				log.debug('Store record in store',this.logAuthor);
				record = this._preSave(record,data,form)
				store.suspendEvents()
				store.add(record);
				this._postSave(record,data)
				log.debug('Reload store',this.logAuthor);
				store.resumeEvents()
				store.load();

				this._cancelForm(form);


			}else{
				log.error('Form is not valid !',this.logAuthor);
				global.notify.notify(_('Invalid form'), _('Please check your form'), 'error')
				return
			}
		}else{
			log.error('Form is not valid !',this.logAuthor);
			global.notify.notify(_('Invalid form'), _('Please check your form'), 'error')
			return
		}

		if (this.saveForm) {
			this.saveForm(form)
		}

		global.notify.notify(_('Success'), _('Record saved'))
			
	},
	
	_validateForm: function(store, data, form) {
		if (this.validateForm){
			return this.validateForm(store, data, form);
		}else{
			return true;
		}
	},

	_preSave: function(record,data,form){
		log.debug('Pre-Save',this.logAuthor);
		if (this.preSave){
			return this.preSave(record,data,form)
		}else{
			return record
		}
	},

	_postSave: function(record){
		log.debug('Post-Save',this.logAuthor);
		if (this.postSave){
			return this.postSave(record)
		}else{
			return record
		}
	},

	_cancelForm : function(form) {
		log.debug('clicked cancelForm',this.logAuthor);
		if (this.formXtype) {
			var id = form.id
			log.debug(" Close '"+id+"'",this.logAuthor);
			
			if (form.win){
				form.win.close()
				this._keynav.enable()
			}else{
				form.close()
			}
		}

		if (this.cancelForm) {
			this.cancelForm(form)
		}
	},
	
	_showForm: function(item) {
		log.debug('Show form',this.logAuthor);
		
		if (this.showForm)
			return this.showForm(item)
		
		var id = undefined
		var data = undefined
		var editing = false
		
		// Edit
		if (item){
			id = this.formXtype + '-' + item.internalId.replace(/[\. ]/g,'-') + '-form'
			data = item.data
			editing = true
		}
		
		if (this.formXtype) {
			if (this.EditMethod == "tab"){
				// Create new TAB
				var main_tabs = Ext.getCmp('main-tabs')
				var tab = Ext.getCmp(id);
				
				if (tab) {
					log.debug("Tab '"+id+"' allready open, just show it",this.logAuthor)
					main_tabs.setActiveTab(tab);
				}else{
					log.debug("Create tab '"+this.formXtype+"'",this.logAuthor)
					var form = main_tabs.add({
						id: id,
						title: '*'+ _('New') +' '+this.modelId,
						xtype: this.formXtype,
						EditMethod: this.EditMethod,
						editing: editing,
						record: data,
						closable: true,
					}).show();
					form.win = undefined
					
					this._keynav.disable()
				}
				
			}else{
				var form = Ext.getCmp(id);
				
				if (form){
					log.debug("Window '"+id+"' allready open, just show it",this.logAuthor)
					form.win.show();
				}else{
					// Create new Window
					log.debug("Create window '"+this.formXtype+"'",this.logAuthor)
					var form = Ext.create('widget.' + this.formXtype, {
						id: id,
						EditMethod: this.EditMethod,
						editing: editing,
						record: data,
					})
					
					var win = Ext.create('widget.window', {
						title: _(this.modelId),
						items: form,
						closable: true,
						constrain:true,
						renderTo: this.grid.id,
						closeAction: 'destroy',
					}).show();
					form.win = win
					this._keynav.disable()
				}
			}
			
			this._bindFormEvents(form)
			return form;
			
		}
	},
	
	_sendByMail: function(){
		log.debug('Clicked sendByMail',this.logAuthor)
		grid = this.grid;
		item = grid.getSelectionModel().getSelection()[0];
		if(this.sendByMail){
				this.sendByMail(item)
		}
	},
	
	_authkey: function(){
		log.debug('Clicked authentification key',this.logAuthor)
		grid = this.grid;
		item = grid.getSelectionModel().getSelection()[0];
		
		var config = {
			account: item.get('user'),
			constrain:true,
			renderTo: grid.id
		}
		
		var authkey = Ext.create('canopsis.lib.view.cauthkey',config)
		authkey.show()
	},
	
	_runItem: function(){
		log.debug('Clicked runItem',this.logAuthor)
		grid = this.grid;
		item = grid.getSelectionModel().getSelection()[0];
		if(this.runItem){
			this.runItem(item)
		}
	},
		
		
	_rename: function(view, item, index){
		log.debug('Clicked rename',this.logAuthor)
		grid = this.grid;
		item = grid.getSelectionModel().getSelection()[0];
		
		//check rights
		var ctrl = this.getController('Account')
		if(ctrl.check_record_right(item,'w')){
			if(this.rename){
					this.rename(item)
			}
		} else {
			global.notify.notify(_('Access denied'),_('You don\'t have the rights to modify this object'),'error')
		}
	},

	_editRecord: function(view, item, index) {
		if (! this.allowEdit)
			return

		log.debug('Clicked editRecord',this.logAuthor);

		//check rights
		var ctrl = this.getController('Account')
		if(ctrl.check_record_right(item,'w')){
			var form = this._showForm(item)
					
			if (form){
				if (this.beforeload_EditForm) {
					this.beforeload_EditForm(form,item)
				}

				form.loadRecord(item);

				if (this.afterload_EditForm) {
					this.afterload_EditForm(form,item)
				}
			}	
			
			if (this.editRecord)
				this.editRecord(view, item, index)
		} else {
			global.notify.notify(_('Access denied'),_('You don\'t have the rights to modify this object'),'error')
		}
	},
	
	_contextMenu : function(view, rec, node, index, e) {
		//don't auto select if multi selecting
		var selection = this.grid.getSelectionModel().getSelection()
		if( selection.length < 2)
			view.select(rec)
			
		this.grid.contextMenu.showAt(e.getXY());
		return false;
    },
	
	_duplicateRecord: function() {
		log.debug('clicked duplicateRecord',this.logAuthor);
		grid = this.grid;
		item = grid.getSelectionModel().getSelection()[0];
		
		var editing = true

		if (this.formXtype) {
			if (this.EditMethod == "tab"){
				var main_tabs = Ext.getCmp('main-tabs')
				var id = this.formXtype + '-' + item.internalId.replace(/[\. ]/g,'-') + '-tab'
				var tab = Ext.getCmp(id);
				if (tab) {
					log.debug("Tab '"+id+"'allerady open, just show it",this.logAuthor)
					main_tabs.setActiveTab(tab);
				}else{
					log.debug("Create tab '"+id+"'",this.logAuthor)
					var form = main_tabs.add({
						title: _('Edit')+' '+item.raw.crecord_name,
						xtype: this.formXtype,
						id: id,
						closable: true,}).show();
				}
				
			}else{
				var form = Ext.getCmp(id);
				
				if (form){
					log.debug("Window '"+id+"' allready open, just show it",this.logAuthor)
					form.win.show();
				}else{
					// Create new Window
					log.debug("Create window '"+this.formXtype+"'",this.logAuthor)
					var form = Ext.create('widget.' + this.formXtype, {
						id: id,
						EditMethod: this.EditMethod,
						editing: editing,
						record: data,
					})
					
					var win = Ext.create('widget.window', {
						title: this.modelId,
						items: form,
						closable: true,
						constrain:true,
						renderTo: this.grid.id,
						closeAction: 'destroy',
					}).show();
					form.win = win
					this._keynav.disable()
				}
			}
			
			// load records
			if (this.beforeload_DuplicateForm) {
				this.beforeload_DuplicateForm(form)
			}

			form.loadRecord(item);

			if (this.afterload_DuplicateForm) {
				this.afterload_DuplicateForm(form)
			}

			this._bindFormEvents(form)	
		}
	},
	
	_searchRecord : function(){
		log.debug('Clicked on searchButton',this.logAuthor);
		
		var grid = this.grid;
		var store = grid.getStore();
		var search = grid.down('textfield[name=searchField]').getValue();

		if (search == '' ){
			store.clearFilter()
			//store.load()
		}else{
			//create an array and give it to store.search
			var myArray = []
			for (i in grid.opt_bar_search_field){
				var tempObj = {}
				tempObj[grid.opt_bar_search_field[i]] = { "$regex" : ".*"+search+".*", "$options" : "i"};
				myArray.push(tempObj);
			}
			
			store.search(store.getOrFilter(myArray), false);
		}
		
		if (grid.pagingbar){
			grid.pagingbar.moveFirst();
		}else{
			store.load()
		}
	}
	
	
	
});

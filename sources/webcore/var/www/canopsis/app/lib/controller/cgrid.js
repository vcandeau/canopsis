Ext.define('canopsis.lib.controller.cgrid', {
	extend: 'Ext.app.Controller',
  	
	refs: [
		{
			ref: 'deleteButton',
			selector: '#deleteButton'
		},
		{
			ref: 'grid',
			selector: 'gridpanel'
		},
		{
			ref: 'form',
			selector: 'form'
		}
	],

    init: function() {
        console.log('[controller][cgrid] - Initialize ...');
        
        this.control({
			////////////////Action for AccountGrid
			'gridpanel': {
				itemdblclick: this._editRecord,
				selectionchange: this._selectionchange
			},
			'gridpanel #addButton' : {
				click: this._addButton
			},
			'gridpanel #deleteButton' : {
				click: this._deleteButton
			},
			/////////////Action gor AccountForm (adding form)
			'form #saveForm': {
				click: this._saveForm
			},
			'form #cancelForm': {
				click: this._cancelForm
			},
			///////////Action for AccountFormEdit (updating form)
			'form #saveForm': {
				click: this._saveForm
			},
			'form #cancelForm': {
				click: this._cancelForm
			},
			
		});
	},
   
	_selectionchange: function(view, records){
		console.log('[controller][cgrid] - selectionchange');

		//Enable delete Button
		this.getDeleteButton().setDisabled(records.length === 0);

		if (this.selectionchange) {
			this.selectionchange(view, records)
		}
	}, 

	_deleteButton: function(button) {
		console.log('[controller][cgrid] - clicked deleteButton');
		var grid = this.getGrid();

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
		console.log('[controller][cgrid] - clicked addButton');

		if (this.form) {
			var main_tabs = Ext.getCmp('main-tabs')
			var id = this.form +'.tab'
			var tab = Ext.getCmp(id);
			if (tab) {
				log.debug("[controller][cgrid] - Tab '"+id+"'allerady open, just show it")
				main_tabs.setActiveTab(tab);
			}else{
				log.debug("[controller][cgrid] - Create tab '"+id+"'")
				main_tabs.add({
					title: '* New '+this.model,
					xtype: this.form,
					id: id,
					closable: true,}).show();
			}
		}
		

		if (this.addButton) {
			this.addButton(button)
		}
		
	},
	
	_saveForm: function(button) {
		console.log('[controller][cgrid][form] - clicked saveForm');
		var form = this.getForm().form;
		var store = this.getGrid().store;

		if (form.isValid()){
			var data = form.getValues();
			if (this._validateForm(store, data, form)) {
				console.log('[controller][cgrid][form] - Form is conform');
				var record = Ext.create('canopsis.model.'+this.model, data);
				console.log('[controller][cgrid][form] - Store record in store');
				this._preSave(record)
				store.add(record);
				this._postSave(record)
				console.log('[controller][cgrid][form] - Reload store');
				store.load();

				this._cancelForm();


			}else{
				console.log('[controller][cgrid][form] - Form is not valid !');
			}
		}else{
			console.log('[controller][cgrid][form] - Form is not valid !');
		}

		if (this.saveForm) {
			this.saveForm(button)
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
		console.log('[controller][cgrid][form] - Pre-Save');
		if (this.preSave){
			return this.preSave(record)
		}else{
			return record
		}
	},

	_postSave: function(record){
		console.log('[controller][cgrid][form] - Post-Save');
		if (this.postSave){
			return this.postSave(record)
		}else{
			return record
		}
	},

	_cancelForm : function(button) {
		console.log('[controller][cgrid][form] - clicked cancelForm');
		if (this.form) {
			var id = this.getForm().form.id
			console.log("[controller][cgrid][form] - Close '"+id+"'");
			var tab = Ext.getCmp(id);
			if (tab) {
				tab.close()
			}
		}

		if (this.cancelForm) {
			this.cancelForm(button)
		}
	},

	_editRecord: function(view, item, index) {
		console.log('[controller][cgrid][form] - clicked editRecord');

		if (this.form) {
			var main_tabs = Ext.getCmp('main-tabs')
			var id = this.form + '.' + item.internalId + '.tab'
			var tab = Ext.getCmp(id);
			if (tab) {
				log.debug("[controller][cgrid] - Tab '"+id+"'allerady open, just show it")
				maintabs.setActiveTab(tab);
			}else{
				log.debug("[controller][cgrid] - Create tab '"+id+"'")
				main_tabs.add({
					title: 'Edit '+item.raw.crecord_name,
					xtype: this.form,
					id: id,
					closable: true,}).show();

				this.getForm().form.loadRecord(item);

			}
		}	
		
		if (this.editRecord) {
			this.editRecord(view, item, index)
		}
	}
	
});

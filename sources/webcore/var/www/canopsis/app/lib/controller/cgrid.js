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
		grid.on('itemdblclick', 	this._editRecord,	this)
		
		
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
		
		//search buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=search]')
		for (i in btns){
			btns[i].on('click', this._searchRecord, this)
		}
		
		//if you don't clean it the next time you use the store params still there
		grid.store.proxy.extraParams = {};
		
		//bind keynav
		var textfields = Ext.ComponentQuery.query('#' + id + ' textfield[name=searchField]')
		for (i in textfields){
				var textfield = textfields[i];
				Ext.create('Ext.util.KeyNav', textfield.id, {
					scope: this,
					enter: this._searchRecord
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
		
		if(search){
			//creating filter
			if (grid.opt_tbar_search_field.length == 1){
				var mfilter = '{"'+ grid.opt_tbar_search_field[0]+'":{ "$regex" : ".*'+search+'.*", "$options" : "i"}}';
			} else {
				var mfilter = '{"$or": [';
				for (i in grid.opt_tbar_search_field){
					if(i != 0){	mfilter += ',';	}
					mfilter += '{"'+ grid.opt_tbar_search_field[i]+'":{ "$regex" : ".*'+search+'.*", "$options" : "i"}}';
				}
				mfilter += ']}';
			}
			//log.debug(mfilter);
			
			//adding option to store
			store.proxy.extraParams = {
				'filter': mfilter
			};
			store.load();
		}else{
			store.proxy.extraParams = {};
			store.load();
		}
		
		if (this.searchRecord) {
			this.searchRecord()
		}
		
	}
	
});

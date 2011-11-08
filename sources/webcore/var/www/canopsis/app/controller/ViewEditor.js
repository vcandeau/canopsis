Ext.define('canopsis.controller.ViewEditor', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['ViewEditor.View', 'ViewEditor.Form'],
	stores: ['View', 'Widget'],
	models: ['view', 'widget'],

	iconCls: 'icon-crecord_type-view',

	init: function() {
		console.log('['+this.id+'] - Initialize ...');

		this.formXtype = 'ConfigView'
		this.listXtype = 'ViewEditor'

		this.modelId = 'view'

		this.callParent(arguments);
	},
	
	_saveForm : function(form){
		
		var store = this.grid.store;
		var record = Ext.create('canopsis.model.'+this.modelId, data);
		
		log.debug('[controller][cgrid][form] - Form is conform');
		
		//parsing items
		var temptab = [];
		
		form.ItemsStore.each(function(record) {
			temptab.push(record.data);
		});
		record.set('items', temptab);
		
		//crecord_name and name fixing
		var record_name = form.down('#crecord_name').getValue()
		record.set('crecord_name',record_name);
		record.set('id','view.' + record_name);
		
		record.set('refreshInterval',form.down('#refreshInterval').getValue());
		record.set('nbColumns',form.down('#nbColumns').getValue());
		
		//get nodeId if defined
		_nodeId = form.down('gridpanel').store.getAt(0);
		if (_nodeId){
			record.set('nodeId', _nodeId.get('id'));
		}
		
		log.debug('[controller][cgrid][form] - Store record in store');
		store.add(record);
		store.load();
		
		this._cancelForm(form);
	},
	
	beforeload_EditForm: function(form){
		var user_textfield = form.GlobalOptions.down('textfield[name=crecord_name]')
		if (user_textfield){
			user_textfield.disable();
		}
	},

	afterload_EditForm: function(form){
		var cinventory = form.GlobalOptions.down('panel');
		var splited = form.nodeId.split(".");
		//cinventory.InventoryStore.load({params: { 'search': search}});
		//console.log(cinventory.InventoryStore);
		//console.log(cinventory.InventoryStore.first());
		node = Ext.ClassManager.instantiate('canopsis.model.inventory',{
			_id : form.nodeId,
			source_type : splited[4],
			host_name : splited[5],
			service_description : splited[6],
		});
		cinventory.store.add(node);
		
		
	}


});

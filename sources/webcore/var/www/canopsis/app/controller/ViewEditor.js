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
		
		record.set('nodeId',form.down('gridpanel').store.getAt(0).get('id'));
		
		
		log.debug('[controller][cgrid][form] - Store record in store');
		store.add(record);
		store.load();
		
		this._cancelForm(form);
	},

});

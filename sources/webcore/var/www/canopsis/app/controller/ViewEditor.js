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
		record.set('id','view.' + record_name);
		record.set('rowHeight',form.down('numberfield[name=rowHeight]').getValue());
		record.set('refreshInterval',form.down('numberfield[name=refreshInterval]').getValue());
		record.set('nbColumns',form.down('numberfield[name=nbColumns]').getValue());
		record.set('rowHeight',form.down('numberfield[name=rowHeight]').getValue());
		
		//get nodeId if defined
		panel = form.down('gridpanel');
		_nodeId = panel.store.getAt(0);
		//console.log(_nodeId);
		if (_nodeId){
			console.log('there is a nodeId');
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
		if (form.nodeId){
			var cinventory = form.GlobalOptions.down('panel');
			tab = []
			tab.push(form.nodeId);
			cinventory.LoadStore(tab);
		}
		
	}


});

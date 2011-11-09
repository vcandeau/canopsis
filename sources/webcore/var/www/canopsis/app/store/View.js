Ext.define('canopsis.store.View', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.view',
	
	storeId: 'store.View',
	
	autoLoad: true,
	autoSync: true,
	
	proxy: {
		type: 'rest',
		url: '/rest/object/view',
		extraParams: { onlyWritable: 1 },
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success',
		},
		writer: {
			type: 'json'
		},
	},
	/*load: function (){
		log.debug('View store loaded.')
		log.dump(this.getById('view.root.dashboard'))
	},*/
});


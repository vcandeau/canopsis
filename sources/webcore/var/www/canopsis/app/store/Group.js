Ext.define('canopsis.store.Group', {
	extend: 'Ext.data.Store',
	model: 'canopsis.model.Group',

	autoLoad: true,
	autoSync: true,
	storeId: 'store.Group',

	proxy: {
		type: 'rest',
		url: '/rest/object/group',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
		writer: {
			type: 'json',
			writeAllFields: false,
		},
	},
	
});

Ext.define('canopsis.store.Group', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.Group',
	
	storeId: 'store.Group',

	autoLoad: true,
	autoSync: true,

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

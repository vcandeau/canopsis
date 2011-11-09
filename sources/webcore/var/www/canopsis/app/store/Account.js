Ext.define('canopsis.store.Account', {
    extend: 'canopsis.lib.store.cstore',
    model: 'canopsis.model.Account',

	storeId: 'store.Account',

	autoLoad: true,
	autoSync: true,
	sorters: ['user'],
	groupField: 'aaa_group',
	proxy: {
		type: 'rest',
		url: '/account/',
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
	}
	
});

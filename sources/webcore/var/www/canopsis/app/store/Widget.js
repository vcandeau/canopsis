Ext.define('canopsis.store.Widget', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.widget',
	
	storeId: 'store.Widget',

	autoLoad: true,
	
	proxy: {
		type: 'rest',
		url: '/ui/widgets',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
	}
	
});

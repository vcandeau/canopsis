Ext.define('canopsis.store.ViewEditor', {
	extend: 'Ext.data.Store',
	storeId: 'store.ViewEditor',
	
	
	fields: [
		{name: 'id'},
		{name: 'crecord_name'},
		{name: 'column'},
		{name: 'lines'},
		{name: 'hunit'},
    ],	
    	
    autoLoad: true,
	proxy: {
		type: 'rest',
		url: '/rest/object/view',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		}
	},

	
});


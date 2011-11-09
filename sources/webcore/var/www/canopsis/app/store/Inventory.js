Ext.define('canopsis.store.Inventory', {
    extend: 'canopsis.lib.store.cstore',
    
	storeId: 'store.Inventory',

	fields : [ 
		{name : '_id'} ,
		{name : 'host_name'},
		{name : 'source_name'},
		{name : 'source_type'},
		{name : 'crecord_type'}
	],

	groupField: 'source_type',

	//autoLoad: true,

	proxy: {
		type: 'rest',
		url: '/rest/inventory',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
	}
	
});

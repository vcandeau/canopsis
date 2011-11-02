Ext.define('canopsis.store.Inventory', {
    extend: 'Ext.data.Store',

	fields : [ 
		{name : '_id'} ,
		{name : 'host_name'},
		{name : 'source_name'},
		{name : 'source_type'},
		{name : 'crecord_type'}
	],

	groupField: 'source_type',

	//autoLoad: true,
	storeId: 'store.Inventory',
	

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

/*
	proxy: {
			type: 'memory',
			reader: {
				type: 'json',
				root: 'data'
			}
		},
	
	data: {'data':[
        { "_id": "id_super_longue1",  "host_name": "computer1","source_name" : "one", "source_type": "event" },
        { "_id": "id_super_longue2",  "host_name": "computer2","source_name" : "two", "source_type": "check" },

    ]},
	*/
	
});

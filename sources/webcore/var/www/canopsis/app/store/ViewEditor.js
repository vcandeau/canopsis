Ext.define('canopsis.store.ViewEditor', {
	extend: 'Ext.data.Store',
	storeId: 'store.ViewEditor',
	
	
	fields: [
		{name: 'id'},
		{name: 'name'},
		{name: 'nodeId'},
		{name: 'column'},
		{name: 'items'},
		{name: 'hunit'},
		{name: 'refreshInterval'}

		//{name: 'expanded'},
		//{name: 'leaf'},
    ],
    	
    autoLoad: true,
    autoSync: true,
	proxy: {
		type: 'rest',
		url: '/ui/views',
		//actionMethods: {
			//create : 'POST',
			//read : 'GET', // defaults to GET
			//update : 'DELETE', //need this tweak to destroy views
			//destroy: 'DELETE'
		//},
		reader: {
			type: 'json',
		},
		writer: {
			type: 'json',
			writeAllFields: false
		}
	},
	/*
	root: {
			text: 'Views',
			id: 'root',
			expanded: true
		}
	*/
});


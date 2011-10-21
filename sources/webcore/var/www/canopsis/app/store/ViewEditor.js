Ext.define('canopsis.store.ViewEditor', {
	extend: 'Ext.data.TreeStore',
	storeId: 'store.ViewEditor',
	
	
	fields: [
		{name: 'id'},
		{name: 'name'},
		//{name: 'column'},
		{name: 'lines'},
		{name: 'expanded'},
		{name: 'leaf'},
    ],
    	
    autoLoad: true,
	proxy: {
		type: 'rest',
		url: '/ui/views',
		reader: {
			type: 'json',
		}
	},


	root: {
			text: 'Views',
			id: 'root',
			expanded: true
		}
	
});


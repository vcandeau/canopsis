Ext.define('canopsis.store.ViewEditor', {
	extend: 'Ext.data.TreeStore',
	storeId: 'store.ViewEditor',
	fields: [
		{name: 'id'},
		{name: 'leaf'},
		{name: 'view'},
		{name: 'expanded'},
		{name: 'text'},
    	],		
	proxy: {
		type: 'ajax',
		url: '/ui/menu',
		reader: {
			type: 'json'
		}
	},
	
	root: {
		//text: 'View',
		id: 'root',
		expanded: true
	}
});


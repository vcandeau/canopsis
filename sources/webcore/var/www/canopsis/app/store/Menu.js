Ext.define('canopsis.store.Menu', {
	extend: 'canopsis.lib.store.ctreeStore',
	
	storeId: 'store.Menu',
	
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
		text: 'Menu',
		id: 'root',
		expanded: true
	}
});


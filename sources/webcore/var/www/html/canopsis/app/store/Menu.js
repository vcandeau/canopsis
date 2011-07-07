Ext.define('canopsis.store.Menu', {
	extend: 'Ext.data.TreeStore',
		
	proxy: {
		type: 'ajax',
		url: '/webservices/menu/list',
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


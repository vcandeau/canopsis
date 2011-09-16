Ext.define('canopsis.store.Menu', {
	extend: 'Ext.data.TreeStore',
		
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


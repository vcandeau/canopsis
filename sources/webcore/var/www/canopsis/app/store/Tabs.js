Ext.define('canopsis.store.Tabs.model', {
	extend: 'Ext.data.Model',
	fields: ['id', 'view_id', 'options', 'title', 'closable'],

});

Ext.define('canopsis.store.Tabs', {
	extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.store.Tabs.model',
	id: 'Tabs',

	proxy: {
		type: 'localstorage',
		id: 'canopsis.store.tabs'
	},

	autoLoad: false,
	autoSync: true,
});


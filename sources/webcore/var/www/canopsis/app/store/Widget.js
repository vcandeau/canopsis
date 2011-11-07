Ext.define('canopsis.store.Widget', {
	extend: 'Ext.data.Store',
	model: 'canopsis.model.widget',

	autoLoad: true,
	
	proxy: {
		type: 'ajax',
		url: 'data/Widget.json',
		reader: {
			type: 'json',
		}
	 },
	
});

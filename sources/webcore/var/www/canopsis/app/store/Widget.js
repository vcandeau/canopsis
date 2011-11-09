Ext.define('canopsis.store.Widget', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.widget',
	
	storeId: 'store.Widget',

	autoLoad: true,
	
	proxy: {
		type: 'ajax',
		url: 'data/Widget.json',
		reader: {
			type: 'json',
		}
	 },
	
});

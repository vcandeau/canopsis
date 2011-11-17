Ext.define('canopsis.store.LiveEvents', {
	extend: 'canopsis.lib.store.cstore',

	model: 'canopsis.model.inventory',
	
	storeId: 'store.LiveEvents',

	/*sorters: [{
		property : 'timestamp',
		direction: 'DESC'
	}],*/

	data : []
});

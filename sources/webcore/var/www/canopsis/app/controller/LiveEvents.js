Ext.define('canopsis.controller.LiveEvents', {
	extend: 'Ext.app.Controller',

	stores: ['LiveEvents'],

	views: [],
	
	maxEvents: 20,

	init: function() {
		this.store = Ext.data.StoreManager.lookup('LiveEvents');

		this.getController('WebSocket').on('message', function(ws, evt, data) {
			this.store.insert(0, data);

			// rotate store
			var count = this.store.count()
			if (count > this.maxEvents){
				this.store.removeAt(count-1);
			}
			
		}, this);

	},

});

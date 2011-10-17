Ext.define('canopsis.store.Account', {
    extend: 'Ext.data.Store',
    model: 'canopsis.model.Account',

	autoLoad: true,
	autoSync: true,
	storeId: 'store.Account',
    proxy: {
		type: 'rest',
		url: '/account/',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
		writer: {
			type: 'json',
			writeAllFields: false,
		},
		//raise an exception if server didn't accept the request
		//and display a popup if the store is modified
		listeners: {
                exception: function(proxy, response, operation){
                    Ext.MessageBox.show({
                        title: 'REMOTE EXCEPTION',
                        msg: 'Loading accounts failed',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
                },
        }
      },
	
});

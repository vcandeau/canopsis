Ext.define('canopsis.store.Account', {
    extend: 'Ext.data.Store',
    model: 'canopsis.model.Account',

	autoLoad: true,
	storeId: 'store.Account',
    proxy: {
		type: 'rest',
		url: '/rest/object/account',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
		/*writer: {
			type: 'json',
            writeAllFields: true,
            root: 'data'
		},*/
		//raise an exception if server didn't accept the request
		listeners: {
                exception: function(proxy, response, operation){
                    Ext.MessageBox.show({
                        title: 'REMOTE EXCEPTION',
                        msg: operation.getError(),
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK
                    });
                }
            }
	},
});

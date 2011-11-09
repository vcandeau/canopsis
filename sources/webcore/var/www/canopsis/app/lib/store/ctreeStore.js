Ext.define('canopsis.lib.store.ctreeStore', {
	extend: 'Ext.data.TreeStore',
    
    //raise an exception if server didn't accept the request
	//and display a popup if the store is modified
    listeners: {
		exception: function(proxy, response, operation){
			Ext.MessageBox.show({
				title: 'REMOTE EXCEPTION',
				msg: this.storeId + ': request failed',
				icon: Ext.MessageBox.ERROR,
				buttons: Ext.Msg.OK
			});
			log.debug(response);
		},
   }	
});

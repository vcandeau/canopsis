Ext.define('canopsis.lib.store.cstore', {
    extend: 'Ext.data.Store',
    
    pageSize: global.pageSize,
    remoteSort : true,
    
    baseFilter : false,

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
   },
  
   //function for search and filter
   setFilter : function(filter){
	   this.baseFilter = filter;
	   if(filter){
		   this.proxy.extraParams = { "filter" : filter };
		}
   },

   getFilter : function(){
	   return this.proxy.extraParams.filter
   },
   
   
   search : function(myArray){
	   if(this.baseFilter){
		   log.debug('theres filter');
		   var newObject = this.baseFilter;
		   newObject["$or"] = myArray;
		   //log.debug(Ext.JSON.encode(newObject));
	   } else {
		   log.debug('no filter');
		   var newObject = {"$or" : myArray};
		   //log.debug(Ext.JSON.encode(newObject));
	   }
	   this.proxy.extraParams.filter = Ext.JSON.encode(newObject);
	   this.load();
   },
   
   
   
   
   	
});

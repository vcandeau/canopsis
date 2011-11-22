Ext.define('canopsis.lib.store.cstore', {
    extend: 'Ext.data.Store',
    
    pageSize: global.pageSize,
    remoteSort : true,
    
    baseFilter : false,

	logAuthor: '[cstore]',
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
		log.debug('[cstore]Setting base store filter ')
		this.baseFilter = filter;
		if(typeof(filter) == 'object'){
			filter = Ext.JSON.encode(filter);
		}
		this.proxy.extraParams.filter = filter;
   },

   getFilter : function(){
	   return this.proxy.extraParams.filter
   },
   
   getOrFilter: function(filter){
	return {"$or" : filter};
   },

   search : function(filter){
	   log.debug('[cstore] Building filter request')
	   if(this.baseFilter){
		   var newObject = Ext.JSON.decode(this.baseFilter);
		   newObject.push(filter);
	   } else {
		   var newObject = filter;
	   }
	   this.proxy.extraParams.filter = Ext.JSON.encode(newObject);
	   log.debug('[cstore] Filter: ' + this.proxy.extraParams.filter);
	   this.load();
   },
   
   
   
   
   	
});

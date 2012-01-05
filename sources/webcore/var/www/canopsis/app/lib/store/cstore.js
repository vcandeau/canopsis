/*
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------
*/
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
				title: _('REMOTE EXCEPTION'),
				msg: this.storeId + ': ' + _('request failed'),
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

   getAndFilter: function(filter){
	return {"$and" : filter};
   },

   search : function(filter){
	   log.debug('[cstore] Building filter request')
	   if(this.baseFilter){
		   var newObject = Ext.JSON.decode(this.baseFilter);
		   newObject = this.getAndFilter([newObject, filter]);
	   } else {
		   var newObject = filter;
	   }
	   this.proxy.extraParams.filter = Ext.JSON.encode(newObject);
	   log.debug('[cstore] Filter: ' + this.proxy.extraParams.filter);
	   this.load();
   },
   	
});

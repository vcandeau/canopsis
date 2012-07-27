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
    remoteSort: true,

    baseFilter: false,

	logAuthor: '[cstore]',

    listeners: {
		update: function() {
			if (this.storeId !== 'Tabs')
				if (global.websocketCtrl)
					global.websocketCtrl.publish_event('store', this.storeId, 'update');
		},
		remove: function() {
			if (this.storeId !== 'Tabs')
				if (global.websocketCtrl)
					global.websocketCtrl.publish_event('store', this.storeId, 'remove');
		},
		write: function(store, operation,option) {
			if (operation.action == 'create')
				global.notify.notify(_('Success'), _('Record saved'),'success');
			if(operation.action == 'destroy')
				global.notify.notify(_('Success'), _('Record deleted'),'success');

		}
   },

   //function for search and filter
   setFilter: function(filter) {
		log.debug('Setting base store filter', this.logAuthor);
		if (typeof(filter) == 'object') {
			this.baseFilter = filter;
		}else {
			this.baseFilter = Ext.JSON.decode(filter);
		}

		// For first load
		this.proxy.extraParams.filter = Ext.JSON.encode(this.baseFilter);
   },

   clearFilter: function() {
		if (this.baseFilter)
			this.proxy.extraParams.filter = Ext.JSON.encode(this.baseFilter);
		else
			delete this.proxy.extraParams['filter'];
   },

   getFilter: function() {
	   return this.proxy.extraParams.filter;
   },

   getOrFilter: function(filter) {
	return {'$or' : filter};
   },

   getAndFilter: function(filter) {
	return {'$and' : filter};
   },

   search: function(filter, autoLoad) {
		if (autoLoad == undefined)
			autoLoad = true;

		log.debug('Building filter request', this.logAuthor);
		log.debug('baseFilter:', this.logAuthor);
		log.dump(this.baseFilter);
		log.debug('filter:', this.logAuthor);
		log.dump(filter);

		if (this.baseFilter) {
			var newObject = this.baseFilter;
			newObject = this.getAndFilter([newObject, filter]);
		} else {
			var newObject = filter;
		}

		log.debug('Final Filter:', this.logAuthor);
		log.dump(newObject);

		this.proxy.extraParams.filter = Ext.JSON.encode(newObject);

		if (autoLoad) {
			this.load();
		}
   }
});

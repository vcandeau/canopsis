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
Ext.define('canopsis.controller.Tabs', {
	extend: 'Ext.app.Controller',

	logAuthor: '[controller][tabs]',

	stores: ['Tabs'],
	views: ['Tabs.View', 'Tabs.Content'],

	init: function() {
		this.control({
			'tabpanel': {
				tabchange: this.on_tabchange,
				//add: this.on_add,
				//remove: this.on_remove
			},
		});

		var store = Ext.data.StoreManager.lookup('Tabs');
		store.proxy.id = store.proxy.id + '.' + global.account.user
		store.load();
	},

  	on_tabchange: function(tabPanel, new_tab, old_tab, object){
		//log.debug('Tabchange', this.logAuthor);
		tabPanel.old_tab = old_tab
	},
  	/*on_add: function(component, index, object){
		log.debug('Added', this.logAuthor);	
	},

	on_remove: function(component, object){
		log.debug('Removed', this.logAuthor);
	}*/

});

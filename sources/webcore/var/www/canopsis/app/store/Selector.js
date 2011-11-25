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
Ext.define('canopsis.model.Selector', {
    extend: 'Ext.data.Model',

	fields: [
		{name: 'id'},
		{name: 'state'},
    ],

});

Ext.define('canopsis.store.Selector', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.Selector',
	
	storeId: 'store.Selector',
	
	//autoLoad: true,
	
	proxy: {
		type: 'rest',
		url: '/rest/object/selector',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		}
	},
	/*load: function (){
		log.debug('View store loaded.')
		log.dump(this.getById('view.root.dashboard'))
	},*/
});


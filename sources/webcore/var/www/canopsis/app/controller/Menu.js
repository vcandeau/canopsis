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
Ext.define('canopsis.controller.Menu', {
    extend: 'Ext.app.Controller',

    views: ['Menu.View'],
    stores: ['Menu'],

    //itemdblclick: function(Ext.view.View this, Ext.data.Model record, HTMLElement item, Number index, Ext.EventObject e)  {
    itemclick: function(View, record, item, index, e)  {
		// Add tab in main-tab if not exist, else show it.
		if (record.data.leaf){
			if (record.data.view){
				var id=record.getId();
				log.debug('itemclick: '+id);
				//add_view_tab(view_id, title, closable, options, autoshow, save)
				add_view_tab(record.data.view, record.data.text, true, {}, true, true)
			}else{
				log.debug('No view specified ...');
			}
		}
    },


    init: function() {
 	this.control({
            'MenuView': {
		'itemclick': this.itemclick,
            },
        });
    },

});

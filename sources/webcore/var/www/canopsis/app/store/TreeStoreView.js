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
/*
Ext.override(Ext.data.TreeStore, {
    load: function(options) {
        options = options || {};
        options.params = options.params || {};
 
        var me = this,
            node = options.node || me.tree.getRootNode(),
            root;
 
        // If there is not a node it means the user hasnt defined a rootnode yet. In this case lets just
        // create one for them.
        if (!node) {
            node = me.setRootNode({
                expanded: true
            });
        }
 
        if (me.clearOnLoad) {
            // this is what we changed.  added false
            node.removeAll(false);
        }
 
        Ext.applyIf(options, {
            node: node
        });
        options.params[me.nodeParam] = node ? node.getId() : 'root';
 
        if (node) {
            node.set('loading', true);
        }
 
        return me.callParent([options]);
    }
});
*/
Ext.define('canopsis.store.TreeStoreView', {
    extend: 'canopsis.lib.store.ctreeStore',
    model: 'canopsis.model.view',
	
	storeId: 'store.TreeStoreView',
	
	clearOnLoad: true,
	
	proxy: {
			type: 'rest',
			url: '/ui/view',
			reader: {
				type: 'json',
				//root: 'data',
				//totalProperty  : 'total',
				//successProperty: 'success',
			},
			writer: {
				type: 'json'
			},
		},
		listeners: {
			move: function( node, oldParent, newParent, index, options ) {
				this.sync();
			}
		},
	});

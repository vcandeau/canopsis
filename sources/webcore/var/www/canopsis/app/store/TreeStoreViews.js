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

Ext.define('canopsis.store.TreeStoreViews', {
    extend: 'canopsis.lib.store.ctreeStore',
    model: 'canopsis.model.View',

	storeId: 'store.TreeStoreViews',

	autoLoad: false,
	autoSync: false,

	clearOnLoad: true,
	/*
	root:{
		id:'directory.root'
	},
	*/
	//defaultRootId : 'directory.root',

	proxy: {
		type: 'rest',
		url: '/ui/view',
		reader: {
			type: 'json'
			//root: 'data',
			//totalProperty  : 'total',
			//successProperty: 'success',
		},
		writer: {
			type: 'json'
		}
	},

	listeners: {
		move: function(node, oldParent, newParent, index, options ) {
				this.sync();
		}
	},

		//--------------FIX , because without this in 4.0.7 you can't refresh !--------
	//http://www.sencha.com/forum/showthread.php?151674-4.0.7-Tree-Store-Bug&highlight=treestore
	//http://www.sencha.com/forum/showthread.php?151211-Reloading-TreeStore-adds-all-records-to-store-getRemovedRecords
   load : function(options) {
		options = options || {};
		options.params = options.params || {};

		var me = this, node = options.node || me.tree.getRootNode(), root;

		// If there is not a node it means the user hasnt defined a
		// rootnode yet. In this case lets just
		// create one for them.
		if (!node) {
			node = me.setRootNode({
						expanded : true
					});
		}

		// copied from 4.1.0.BETA to fix delete calls to the proxy for the remove element.
		if (me.clearOnLoad) {
			if (me.clearRemovedOnLoad) {
				// clear from the removed array any nodes that were
				// descendants of the node being reloaded so that they
				// do not get saved on next sync.
				me.clearRemoved(node);
			}
			// temporarily remove the onNodeRemove event listener so
			// that when removeAll is called, the removed nodes do not
			// get added to the removed array
			me.tree.un('remove', me.onNodeRemove, me);
			// remove all the nodes
			node.removeAll(false);
			// reattach the onNodeRemove listener
			me.tree.on('remove', me.onNodeRemove, me);
		}

		Ext.applyIf(options, {
					node : node
				});
		options.params[me.nodeParam] = node ? node.getId() : 'root';

		if (node) {
			node.set('loading', true);
		}

		return me.callParent([options]);
	},
	
	setRootNode: function(root) {
        var me = this;

        root = root || {};
        if (!root.isNode) {
            // create a default rootNode and create internal data struct.
            Ext.applyIf(root, {
                id: me.defaultRootId,
                text: 'Root',
                allowDrag: false
            });
            root = Ext.ModelManager.create(root, me.model);
        }
        Ext.data.NodeInterface.decorate(root);

        // Because we have decorated the model with new fields,
        // we need to build new extactor functions on the reader.
        me.getProxy().getReader().buildExtractors(true);

        // When we add the root to the tree, it will automaticaly get the NodeInterface
        me.tree.setRootNode(root);

   /*     // If the user has set expanded: true on the root, we want to call the expand function
        if (!root.isLoaded() && (me.autoLoad === true || root.isExpanded())) {
            me.load({
                node: root
            });
        }*/

        return root;
    },

});

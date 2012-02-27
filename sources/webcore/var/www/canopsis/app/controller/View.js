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
Ext.define('canopsis.controller.View', {
    extend: 'canopsis.lib.controller.ctree',

    views: ['View.TreePanel'],
    stores: ['View','TreeStoreView'],
    model:['view'],
    
    logAuthor: '[controller][View]',

    init: function() {
		log.debug('Initialize ...', this.logAuthor);

		//this.formXtype = 'GroupForm'
		this.listXtype = 'ViewTreePanel'

		this.modelId = 'view'

		this.callParent(arguments);

    },
    
    addLeafButton : function(){
		this.getController('Tabs').create_new_view()
	},
    
    addDirectoryButton : function(){
		Ext.Msg.prompt(_('Directory name'), _('Please enter directory name:'), function(btn, directoryName){
			if (btn == 'ok'){
				//add (if selected) -> add to this node
				//
				var store = Ext.data.StoreManager.lookup('TreeStoreView')
				var record = Ext.create('canopsis.model.view')
				
				var directory_id = 'directory.'+ global.account.user + '.' + global.gen_id()
				
				record.set('crecord_name',directoryName)
				
				record.set('id',directory_id)
				record.set('_id',directory_id)
				//need to set the empty array , otherwise treepanel send request
				//to fetch inside
				record.set('children',[])
				
				store.getRootNode().appendChild(record)
				store.sync()
				
			} else {
				log.debug('cancel new view',this.logAuthor)
			}
		});
	},
	
	itemDoubleClick : function(){
		var tree = this.tree
		
		var selection = tree.getSelectionModel().getSelection()[0];
		log.dump(selection)
		if (selection.get('leaf')){
			view_id = selection.get('id')
			viewName = selection.get('crecord_name')
			add_view_tab(view_id, viewName, true, undefined, true, true, false)
			
		}
	},
    
});

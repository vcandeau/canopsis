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
    model: ['view'],
    
    logAuthor: '[controller][View]',

    init: function() {
		log.debug('Initialize ...', this.logAuthor);

		//this.formXtype = 'GroupForm'
		this.listXtype = 'ViewTreePanel'

		this.modelId = 'view'
		
		log.debug(' + Load treeStore ...', this.logAuthor);
		this.treeStore = Ext.data.StoreManager.lookup('TreeStoreView')
		this.treeStore.load()

		this.callParent(arguments);
		
		
    },
    
    addLeafButton : function(){
		this.create_new_view()
	},
    
    addDirectoryButton : function(){
		this.create_new_directory()
	},
	
	itemDoubleClick : function(){
		var tree = this.tree
		
		var selection = tree.getSelectionModel().getSelection()[0];
		log.dump(selection)
		if (selection.get('leaf')){
			view_id = selection.get('id')
			view_name = selection.get('crecord_name')
			this.getController('Tabs').open_view(view_id, view_name)
		}
	},
	
	/////////////////
	
	create_new_directory: function(){
		Ext.Msg.prompt(_('Directory name'), _('Please enter directory name:'), function(btn, directoryName){
			if (btn == 'ok'){
				
				var record = Ext.create('canopsis.model.view')
				
				var directory_id = 'directory.'+ global.account.user + '.' + global.gen_id()
				
				record.set('crecord_name',directoryName)
				
				record.set('id',directory_id)
				record.set('_id',directory_id)
				//need to set the empty array , otherwise treepanel send request
				//to fetch inside
				record.set('children',[])
				
				//TreeStore.getRootNode().appendChild(record)
				var rootDir = 'directory.root.'+ global.account.user
					
				log.debug('Add directory: ', this.logAuthor)
				log.debug(' + root dir: ' + rootDir, this.logAuthor)
				log.debug(' + name: ' + directoryName, this.logAuthor)
				log.debug(' + id: ' + directory_id, this.logAuthor)
					
				var rootNode = this.treeStore.getNodeById(rootDir)
				
				if (rootNode){
					rootNode.appendChild(record)
					this.treeStore.sync()
					this.treeStore.load()
					
				}else{
					log.debug('Impossible to add directory, root directory not found ....',this.logAuthor)
				}
				
			} else {
				log.debug('cancel new view',this.logAuthor)
			}
		}, this);		
	},

	create_new_view: function(){
		Ext.Msg.prompt(_('View name'), _('Please enter view name:'), function(btn, viewName){
			if (btn == 'ok'){		
				//check if view already exist
				var store = Ext.data.StoreManager.lookup('View')
				var already_exist = store.findBy(
						function(storeRecord, id){
								if(storeRecord.get('crecord_name') == viewName){
									return true;  // a record with this data exists
								}
					}, this);

				if(already_exist != -1){
					Ext.Msg.alert(_('this view already exist'), _("you can't add the same view twice"));
					
				} else {
					// Create view					
					var view_id = 'view.'+ global.account.user + '.' + global.gen_id()
					
					//building record
					var record = Ext.create('canopsis.model.view')
					record.set('id', view_id)
					record.set('crecord_name',viewName)
					record.set('leaf', true)
										
					//append child and 
					var rootDir = 'directory.root.'+ global.account.user
					
					log.debug('Add view: ',this.logAuthor)
					log.debug(' + root dir: ' + rootDir,this.logAuthor)
					log.debug(' + name: ' + viewName,this.logAuthor)
					log.debug(' + id: ' + view_id,this.logAuthor)
					
					var parentNode = this.treeStore.getNodeById(rootDir)
					var rootNode = this.treeStore.getRootNode()
					if (parentNode){
						parentNode.appendChild(record)
						
						//this is a hack
						rootNode.dirty = false
						
						this.treeStore.sync()
						this.treeStore.load()
						
						//open view for edition
						this.getController('Tabs').open_view(view_id, viewName).editMode();
						
					}else{
						log.debug('Impossible to add view, root directory not found ....',this.logAuthor)
					}
				}

			} else {
				log.debug('cancel new view',this.logAuthor)
			}
		}, this);
	}
    
});

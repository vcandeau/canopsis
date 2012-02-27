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
Ext.define('canopsis.lib.controller.ctree', {
	extend: 'Ext.app.Controller',

	init: function() {
		log.debug('[controller][ctree] - '+this.id+' Initialize ...');

		var control = {}
		control[this.listXtype] = {
		                afterrender: this._bindTreeEvents
		}
		this.control(control);

		this.callParent(arguments);

	},
   
	_bindTreeEvents: function(tree) {
		var id = tree.id
		this.tree = tree
		
		log.debug('[controller][ctree] - Bind events "'+id+'" ...')
		
		//------------------Bind Context Menu-----------------------
		if(tree.contextMenu){
			tree.on('itemcontextmenu', this._showMenu)
			
			//Duplicate button
			var btns = Ext.ComponentQuery.query('#' + tree.contextMenu.id + ' [action=duplicate]')
			for (i in btns){
				btns[i].on('click', this._duplicateButton, this)
			}
			//DeleteButton
			var btns = Ext.ComponentQuery.query('#' + tree.contextMenu.id + ' [action=delete]')
			for (i in btns){
				btns[i].on('click', this._deleteButton, this)
			}
			
		}
		
		//--------------------toolbar buttons--------------------------
		//delete
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=delete]')
		for (i in btns){
			btns[i].on('click', this._deleteButton, this)
		}
		
		// Reload button
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=reload]')
		for (i in btns){
			btns[i].on('click', this._reloadButton, this)
		}
		
		// Add buttons
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=add_leaf]')
		for (i in btns){
			btns[i].on('click', this._addLeafButton, this)
		}

		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=add_directory]')
		for (i in btns){
			btns[i].on('click', this._addDirectoryButton, this)
		}
		
		//duplicate
		var btns = Ext.ComponentQuery.query('#' + id + ' button[action=duplicate]')
		for (i in btns){
			btns[i].on('click', this._duplicateButton, this)
		}
		
		
		//---------------------general binding ---------------------
		tree.on('selectionchange',	this._selectionchange,	this)
		
	},

	_selectionchange: function(view, records){
		log.debug('[controller][ctree] - selectionchange');
		var tree = this.tree

		//Enable delete Button
		btns = Ext.ComponentQuery.query('#' + tree.id + ' button[action=delete]')
		for (i in btns){
			btns[i].setDisabled(records.length === 0);
		}
		
		if (this.selectionchange) {
			this.selectionchange(view, records)
		}
	},

	_addDirectoryButton : function(){
		log.debug('add directory')
		
		if(this.addDirectoryButton){
			this.addDirectoryButton()
		}
	},
	
	_addLeafButton : function(){
		log.debug('add leaf')
		
		if(this.addLeafButton){
			this.addLeafButton()
		}
	},

	_duplicateButton : function(){
		log.debug('duplicate')
		
		if(this.duplicateButton){
			this.duplicateButton()
		}
	},
	
	_deleteButton : function(){
		log.debug('[controller][ctree] - clicked deleteButton');
		var tree = this.tree
		
		var selection = tree.getSelectionModel().getSelection();
		for(var i in selection){
			log.debug('selection')
			log.dump(selection[i])
			log.dump(selection[i].childNodes.length)
			if(selection[i].childNodes.length > 0){
				global.notify.notify(_('Directory not empty'),_('The directory must be empty if you want to remove it'))
			} else {
				selection[i].remove()
			}
		}
		tree.store.sync()
		
		if(this.deleteButton){
			this.deleteButton(button, grid, selection)
		}
	},
	
	_reloadButton: function() {
		log.debug('[controller][ctree] - Reload store "'+this.tree.store.storeId+'" of '+this.tree.id);
		this.tree.store.load()
	},

	_showMenu: function(view, rec, node, index, e){
		e.stopEvent();
		this.contextMenu.showAt(e.getXY());
		return false;
	},

});

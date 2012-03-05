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
Ext.define('canopsis.lib.view.crights' ,{
	extend: 'Ext.window.Window',
	
	alias: 'widget.crights',

	logAuthor: '[crights]',
	
	minWidth: 300,
	height: 250,
	border : false,
	
	title : _('Editing Rights'),
	
	//options
	opt_owner : true,
	opt_owner_rights : true,
	opt_group : true,
	opt_group_rights : true,
	opt_others_rights : true,
	
	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		//--------------------creating bbar-------------------
		this.saveButton = Ext.widget('button',{text:_('Save')})
		this.cancelButton = Ext.widget('button',{text:_('Cancel')})
		this.bbar = [this.cancelButton,'->',this.saveButton]
		
		//-------------------binding events--------------------
		this.saveButton.on('click',this._save,this)
		this.cancelButton.on('click',function(){this.close()},this)
		
		this.callParent(arguments);
		
		this.show()
	},
	
	_save : function(){
		log.debug('Saving rights', this.logAuthor)
	
	},
	
	
	
});

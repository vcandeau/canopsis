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
	
	layout : 'fit',
	
	width: 600,
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
		

		//--------------Rights Store (for combo)----------------
		var rights_store = Ext.create('Ext.data.Store', {
			fields: ['text', 'value'],
			data : [
				{text:_('Write and Read'),value : ["r", "w"]},
				{text:_('Read'),value : ["r"]},
				{text:_('Write'),value : ["w"]},
			]
		});
		
		//--------------------bottom fieldSet--------------------
		
		var bottom_panel = Ext.widget('fieldset',{
				title:_('Rights'),
				margin : 4
				//layout : 'hbox',
			})
		
		if(this.opt_owner_rights == true){
			this.combo_owner_rights = Ext.widget('combo',{
				fieldLabel: _("Owner rights"),
				queryMode: 'local',
				displayField: 'text',
				valueField: 'value',
				store : rights_store
			})
			bottom_panel.add(this.combo_owner_rights)
		}
		
		if(this.opt_group_rights == true){
			this.combo_group_rights = Ext.widget('combo',{
				fieldLabel: _("Groups rights"),
				queryMode: 'local',
				displayField: 'text',
				valueField: 'value',
				store : rights_store
			})
			bottom_panel.add(this.combo_group_rights)
		}
		
		if(this.opt_others_rights == true){
			this.combo_others_rights = Ext.widget('combo',{
				fieldLabel: _("Others rights"),
				queryMode: 'local',
				displayField: 'text',
				valueField: 'value',
				store : rights_store
			})
			bottom_panel.add(this.combo_others_rights)
		}
		
		
		//--------------------top fieldSet------------------
		var top_panel = Ext.widget('fieldset',{
				title:_('Owners'),
				margin : 4
				//layout: 'hbox'
			})
		
		if(this.opt_owner == true){
			this.combo_owner = Ext.widget('combo',{
				fieldLabel: _("Owner"),
				queryMode: 'remote',
				displayField: 'user',
				valueField: '_id',
				store : 'Account'
			})
			top_panel.add(this.combo_owner)
		}
		
		if(this.opt_group == true){
			this.combo_group = Ext.widget('combo',{
				fieldLabel: _("Group"),
				queryMode: 'remote',
				displayField: 'crecord_name',
				valueField: '_id',
				store : 'Group'
			})
			top_panel.add(this.combo_group)
		}
		
		//---------------------building panel-----------------
		var inner_panel = Ext.widget('panel',{
				items:[top_panel,bottom_panel],
				layout : 'hbox',
				//bodyPadding: 4,
			})

		this.items = [inner_panel]
		
		
		this.callParent(arguments);
		this.show()
	},
	
	_save : function(){
		log.debug('Saving rights', this.logAuthor)
	
	},
	
	
	
});

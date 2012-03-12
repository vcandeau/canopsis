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
	
	constrain: true,
	constrainHeader: true,
	
	//width: 305,
	//height: 350,
	
	resizable : false,
	
	border : false,
	
	title : _('Editing rights'),
	
	//options
	opt_owner : true,
	opt_owner_rights : true,
	opt_group : true,
	opt_group_rights : true,
	opt_others_rights : true,
	
	data: undefined,
	
	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		//--------------------creating bbar-------------------
		this.saveButton = Ext.widget('button',{
			text:_('Save'),
			iconCls: 'icon-save',
			iconAlign:'right',
			})
		this.cancelButton = Ext.widget('button',{
			text:_('Cancel'),
			iconCls:'icon-cancel',
			})
		this.bbar = [this.cancelButton,'->',this.saveButton]
		
		//-------------------binding events--------------------
		this.saveButton.on('click',function(){this._save(this.data)},this)
		this.cancelButton.on('click',function(){this.close()},this)
		

		//--------------Rights Store (for combo)----------------
		this._build_store()
		
		
		//--------------------bottom fieldSet--------------------
		
		var bottom_panel = Ext.widget('fieldset',{
				title:_('Rights'),
				margin : 4
				//layout : 'hbox',
			})
		
		if(this.opt_owner_rights == true){
			this.combo_owner_rights = Ext.widget('combo',{
				forceSelection: true,
				fieldLabel: _("Owner rights"),
				queryMode: 'local',
				displayField: 'text',
				valueField: 'value',
				store : this.store
			})
			bottom_panel.add(this.combo_owner_rights)
		}
		
		if(this.opt_group_rights == true){
			this.combo_group_rights = Ext.widget('combo',{
				forceSelection: true,
				fieldLabel: _("Group rights"),
				queryMode: 'local',
				displayField: 'text',
				valueField: 'value',
				store : this.store
			})
			bottom_panel.add(this.combo_group_rights)
		}
		
		if(this.opt_others_rights == true){
			this.combo_others_rights = Ext.widget('combo',{
				forceSelection: true,
				fieldLabel: _("Others rights"),
				queryMode: 'local',
				displayField: 'text',
				valueField: 'value',
				store : this.store
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
				forceSelection: true,
				fieldLabel: _("Owner"),
				queryMode: 'local',
				displayField: 'user',
				valueField: 'user',
				store : 'Account'
			})
			top_panel.add(this.combo_owner)
		}
		
		if(this.opt_group == true){
			this.combo_group = Ext.widget('combo',{
				forceSelection: true,
				fieldLabel: _("Group"),
				queryMode: 'local',
				displayField: 'crecord_name',
				valueField: 'crecord_name',
				store : 'Group'
			})
			top_panel.add(this.combo_group)
		}
		
		//---------------------building panel-----------------
		var inner_panel = Ext.widget('panel',{
				items:[top_panel,bottom_panel],
				//layout : 'vbox',
				//bodyPadding: 4,
				border: false,
			})

		this.items = [inner_panel]
		
		//----------------------load values----------------------
		if(this.data != undefined){
			this._load(this.data)
		}
		
		
		this.callParent(arguments);
		this.show()
	},
	
	_save : function(record){
		log.debug('Saving rights', this.logAuthor)
		log.dump(this.combo_owner_rights.getValue())
		
		//creating params to send
		var params = {}
		
		//prepare values
		var aaa_owner = this.combo_owner.getValue()
		var aaa_group = this.combo_group.getValue()
		var aaa_access_owner = this.combo_owner_rights.getValue()
		var aaa_access_group = this.combo_group_rights.getValue()
		var aaa_access_other = this.combo_others_rights.getValue()
		
		//check if null and add them to params
		if(aaa_owner != null){
			params.aaa_owner = aaa_owner
		}
		if(aaa_group != null){
			params.aaa_group = aaa_group
		}
		if(aaa_access_owner != null){
			params.aaa_access_owner = Ext.encode(aaa_access_owner)
		}
		if(aaa_access_group != null){
			params.aaa_access_group = Ext.encode(aaa_access_group)
		}
		if(aaa_access_other != null){
			params.aaa_access_other = Ext.encode(aaa_access_other)
		}
		
		//ajax request
		Ext.Ajax.request({
			url: '/rights/' + record.get('_id'),
			method: 'PUT',
			params: params,
			scope: this,
			success: function(response){
				var text = response.responseText;
				global.notify.notify(_('Success'),_('Rights updated'))
				//close the window
				this.fireEvent('save')
				this.close()
			},
			failure : function(response){
				
				if(response.status == 403){
					global.notify.notify(_('Access denied'),_('You don\'t have the rights to modify this object'),'error')
					log.error(_('Access denied'))
				} else {
					log.error(_('Updating rights have failed'),this.logAuthor)
				}
			}
		});
		
		
	},
	
	//local store for combox
	_build_store : function(){
		this.store = Ext.create('Ext.data.Store', {
			fields: ['text', 'value'],
			data : [
				{text:_('No right'),value : []},
				{text:_('Write and Read'),value : ["r", "w"]},
				{text:_('Read'),value : ["r"]},
				{text:_('Write'),value : ["w"]},
			]
		});
	},
	
	_get_model : function(values){
		var index = this.store.findBy(function(record){
				var data = record.get('value')
				if(values.length == data.length){
					var returned_value = false
					for(i in values){
						if (values[i] == data[i]){
							returned_value = true
						}else{
							returned_value = false
						}
					}
					return returned_value
				}
			})
		return this.store.getAt(index)
	},
	
	_load : function(record){
		log.debug('Loading record values', this.logAuthor)
		
		this.title = this.title + ' "'+ record.get('crecord_name') +'"'
		/*
		log.debug('a_owner : ',this.logAuthor)
		log.dump(record.get('aaa_access_owner'))
		log.debug('a_group : ',this.logAuthor)
		log.dump(record.get('aaa_access_group'))
		log.debug('a_other : ',this.logAuthor)
		log.dump(record.get('aaa_access_other'))
		*/
		//setting data
		this.combo_owner_rights.setValue(this._get_model(record.get('aaa_access_owner')))
		this.combo_group_rights.setValue(this._get_model(record.get('aaa_access_group')))
		this.combo_others_rights.setValue(this._get_model(record.get('aaa_access_other')))
		this.combo_owner.setValue(record.get('aaa_owner'))
		this.combo_group.setValue(record.get('aaa_group'))
	}
	
});

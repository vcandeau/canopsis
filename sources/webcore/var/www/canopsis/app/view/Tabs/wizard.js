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


Ext.require('canopsis.lib.form.field.cinventory');
Ext.require('canopsis.lib.form.field.cmetric');

Ext.define('canopsis.view.Tabs.wizard' ,{
	extend: 'canopsis.lib.view.cwizard',
	
	title : 'Widget Wizard',
	
	data : undefined,
	
	logAuthor : '[widget wizard]',

	initComponent: function() {
		
		//----------------------Build wizard options
		var step1 = {
				title: _('Choose widget'),
				//description : _('choose the type of widget you want, its title, and refresh interval'),
				items : [
				{
					xtype : 'textfield',
					fieldLabel : _('Title'),
					name : 'title'
				},{
					xtype: "combo",
					store: 'Widget',
					forceSelection : true,
					fieldLabel : _('Type'),
					name: "xtype",
					displayField: 'name',
					valueField: 'xtype',
					//value: 'empty',
					allowBlank:false,
				},{
					xtype: 'numberfield',
					fieldLabel: _('Refresh interval'),
					name: 'refreshInterval',
					value: 0,
					minValue: 0
				}]
		}
		/*
		var step2 = {
				title: _('General Options'),
				description: _('Here you choose the component that the widget will display information from'),
				items : [{
						xtype : 'canopsis.lib.form.field.cinventory',
						multiSelect: false,
						name : 'nodeId'
					}
				]
		}
*/
		//this.step_list = [step1,step2]
		this.step_list = [step1]

		this.callParent(arguments);
		
	},
	
	cancel_button: function(){
		log.debug('cancel button',this.logAuthor)
		this.fireEvent('cancel',this.widgetId)
		this.close()
	},
	
	finish_button: function(){
		log.debug('save button',this.logAuthor)
		var combo = Ext.ComponentQuery.query('#' + this.id + ' [name=xtype]')
		if(combo[0].isValid()){
			var variables = this.get_variables()
			log.debug(variables)
			this.fireEvent('save',this.widgetId, variables)
			this.close()
		}
	},
	
	

});

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
Ext.define('canopsis.view.ViewBuilder.wizard' ,{
	extend: 'canopsis.lib.view.cwizard',
	
	title : 'Widget Wizard',

	add_widget_option_step : this.step_change_func,

	initComponent: function() {
		
		//----------------------Build wizard options
		var step1 = {
				title: _('Choose widget'),
				description : _('choose which widget type you want'),
				items : [{
					xtype: "grid",
					store: 'Widget',
					name: "widget",
					columns: [{
						header: _('Name'),
						dataIndex: 'name',
						flex: 1
					},{
						header: _('Description'),
						dataIndex: 'description',
						flex: 2
					}],
				}]
			}
		
		var step2 = {
				title: _('General Options'),
				description: _('General widget option'),
				items : [{
						xtype : 'textfield',
						fieldLabel : _('Title'),
						name : 'title'
					},{
						xtype: 'numberfield',
						fieldLabel: _('Refresh interval'),
						name: 'refreshInterval',
						value: 0,
						minValue: 0
					},{
						xtype : 'panel',
						html : _('choose the nodeId') + ' :',
						border: false
					},{
						xtype : 'canopsis.lib.form.field.cinventory',
						multiSelect: false,
						name : 'nodeId'
					}
				]
			}
		
		
		this.step_list = [ step1,step2],
		this.change_step = {itemName : 'widget',event : 'selectionchange',functionName : this.step_change_func},
		
		this.callParent(arguments);

	},


	//add the new option tab panel in the widget
	step_change_func : function(sel,record){
		log.debug('changed selection')
		var widgetType = record[0].data
		var widgetOptions = widgetType.options
		
		//if there is option for this widget
		if(widgetOptions){
			var new_step = {
				title: _('Widget Options'),
				id : 'widgetOptions',
				description : _('Here you can set specific option type of the selected widget'),
				items : widgetOptions
			}
			this.remove_step('#widgetOptions')
			this.add_new_step(this.build_step(new_step))
		} else {
			this.remove_step('#widgetOptions')
		}
	},




});

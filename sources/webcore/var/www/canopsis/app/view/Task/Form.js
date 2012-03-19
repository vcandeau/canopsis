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
Ext.define('canopsis.view.Task.Form', {
	extend: 'canopsis.lib.view.cform',

	alias: 'widget.TaskForm',
	
	//layout: 'hbox',

    initComponent: function(){
		//----------------fieldSet creation-------------------
		this.generalOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('General options'),
			//layout: 'hbox',
			collapsible: false,
		})
		
		this.timeOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('Period'),
		/*	layout: {
				type: 'hbox',
				align: 'stretch'
			},*/
			collapsible: false,
		})
		
		//-----------------General options----------------------
		
		var TaskName = Ext.widget('textfield',{
				fieldLabel: _('Task name'),
				name: 'name',
				allowBlank: false,
		})
		/*
		var fonctionCombo = Ext.widget('combobox',{
			fieldLabel: _('Action'),
			name : 'task',
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'render_pdf',
			disabled : true,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : [
					{value: 'render_pdf', text: _('Reporting')},
				]
			}
		})
		*/
		var viewCombo = Ext.widget('combobox',{
			fieldLabel: _('View'),
			store:  Ext.create('canopsis.store.View', {autoLoad: false}),
			displayField: 'crecord_name',
			valueField: 'id',
			typeAhead: false,
			minChars: 2,
			queryMode: 'remote',
			emptyText: _('Select a view')+' ...',
		})
		
		this.generalOptions.add([TaskName,viewCombo])
		
		//--------------------------time options--------------
		var durationCombo = Ext.widget('combobox',{
			name: 'every',
			fieldLabel: _('Every'),
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'day',
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : [
					{value: 'day', text: _('Day')},
					{value: 'week', text: _('Week')},
					//{value: 'month', text: _('Month')},
					//{value: 'year', text: _('Year')}
				]
			}
		})
		
		
		var dayCombo = Ext.widget('combobox',{
			name: 'day',
			fieldLabel: _('Day'),
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'monday',
			disabled: true,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : [
					{value: 'monday', text: _('Monday')},
					{value: 'tuesday', text: _('Tuesday')},
					{value: 'wednesday', text: _('Wednesday')},
					{value: 'thursday', text: _('Thursday')},
					{value: 'friday', text: _('Friday')},
					{value: 'satursday', text: _('Satursday')},
					{value: 'sunday', text: _('Sunday')},
				]
			}
		})
		
		var hoursCombo = Ext.widget('timefield',{
			name: 'hours',
			fieldLabel: 'Hours',
			//value: '9:00 AM',
			//minValue: '0:00 AM',
			//maxValue: '11:45 PM',
			increment: 15,
			allowBlank: false,
			submitFormat: 'G:i',
			//anchor: '100%'
		})
			
		this.timeOptions.add([durationCombo,dayCombo,hoursCombo])
		
		//-----------------------Binding Events-------------------
		durationCombo.on('change',function(combo,newValue,oldValue){
			if(newValue == 'day'){
				dayCombo.setDisabled(true)
			} else {
				if(dayCombo.isDisabled())
					dayCombo.setDisabled(false)
			}
		},this)

		//-----------------------Building------------------------
        this.callParent();
        this.add([this.generalOptions,this.timeOptions])
    },
    
});

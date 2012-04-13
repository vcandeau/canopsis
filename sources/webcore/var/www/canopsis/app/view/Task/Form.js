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
			title: _('Frequency'),
		/*	layout: {
				type: 'hbox',
				align: 'stretch'
			},*/
			collapsible: false,
		})
		
		this.reportOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('Reporting Options'),
			layout: 'hbox',
			collapsible: false,
		})
		//-----------------General options----------------------
		
		var TaskName = Ext.widget('textfield',{
				fieldLabel: _('Task name'),
				name: 'crecord_name',
				allowBlank: false,
		})
		
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
					{value: 'task_reporting.render_pdf', text: _('Reporting')},
				]
			}
		})
		
		var viewCombo = Ext.widget('combobox',{
			fieldLabel: _('View'),
			name: 'view',
			store:  Ext.create('canopsis.store.View', {autoLoad: true}),
			displayField: 'crecord_name',
			valueField: 'id',
			typeAhead: false,
			allowBlank: false,
			minChars: 2,
			queryMode: 'remote',
			emptyText: _('Select a view')+' ...',
		})
		
		this.generalOptions.add([fonctionCombo,TaskName,viewCombo])
		
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
					{value: 'month', text: _('Month')},
					{value: 'year', text: _('Year')}
				]
			}
		})
		
		var monthCombo = Ext.widget('combobox',{
			name: 'month',
			fieldLabel: _('Month'),
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'january',
			disabled: true,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : [
					{value: 'january', text: _('January')},
					{value: 'february', text: _('February')},
					{value: 'march', text: _('March')},
					{value: 'April', text: _('April')},
					{value: 'may', text: _('May')},
					{value: 'june', text: _('June')},
					{value: 'july', text: _('July')},
					{value: 'august', text: _('August')},
					{value: 'septembre', text: _('September')},
					{value: 'october', text: _('October')},
					{value: 'november', text: _('November')},
					{value: 'december', text: _('December')},
				]
			}
		})
		
		var dayData = []
		for(var i = 1; i < 32; i++){
			dayData.push({value: i, text: i})
		}
		
		var dayCombo = Ext.widget('combobox',{
			name: 'day',
			fieldLabel: _('Day'),
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 1,
			//disabled: true,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : dayData
			}
		})
		
		var dayWeekCombo = Ext.widget('combobox',{
			name: 'day_of_week',
			fieldLabel: _('Day of week'),
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'monday',
			disabled: true,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : [
					{value: 'mon', text: _('Monday')},
					{value: 'tue', text: _('Tuesday')},
					{value: 'wed', text: _('Wednesday')},
					{value: 'thu', text: _('Thursday')},
					{value: 'fri', text: _('Friday')},
					{value: 'sat', text: _('Satursday')},
					{value: 'sun', text: _('Sunday')},
				]
			}
		})
		
		var hoursCombo = Ext.widget('timefield',{
			name: 'hours',
			fieldLabel: _('Hours'),
			increment: 3,
			allowBlank: false,
			submitFormat: 'G:i',
			//anchor: '100%'
		})
			
		this.timeOptions.add([durationCombo,monthCombo,dayWeekCombo,dayCombo,hoursCombo])
		
		//---------------------------Report option----------------------

		
		var lengthCombo = Ext.widget('combobox',{
			name: 'timeLengthUnit',
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			padding: '0 0 5 5',
			value: global.commonTs.day,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : [
					{value: global.commonTs.day, text: _('Day')},
					{value: global.commonTs.week, text: _('Week')},
					{value: global.commonTs.month, text: _('Month')},
					{value: global.commonTs.year, text: _('Year')}
				]
			}
		})
		
		var unitCombo = Ext.widget('numberfield',{
			name: 'timeLength',
			fieldLabel: _('The last'),
			minValue: 1,
			value : 1,
			allowBlank: false,
			width: 160,
		})

		this.reportOptions.add(unitCombo,lengthCombo)
		
		//-----------------------Binding Events-------------------
		
	
		durationCombo.on('change',function(combo,newValue,oldValue){
			switch(newValue){
				case 'day':
					log.debug('day')
					dayCombo.setDisabled(false)
					dayWeekCombo.setDisabled(true)
					break;
				case 'week':
					log.debug('week')
					dayCombo.setDisabled(false)
					dayWeekCombo.setDisabled(true)
					break;
				case 'month':
					break;
				case 'year':
					break;
					
				default:
					log.debug('Wrong value')
					break;
			}
			
			
			/*
			if(newValue == 'day'){
				dayCombo.setDisabled(true)
			} else {
				if(dayCombo.isDisabled())
					dayCombo.setDisabled(false)
			}
			* */
		},this)
		
		

		//-----------------------Building------------------------
        this.callParent();
        this.add([this.generalOptions,this.timeOptions,this.reportOptions])
    },
    
});

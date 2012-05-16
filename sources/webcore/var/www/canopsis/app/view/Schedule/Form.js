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
Ext.define('canopsis.view.Schedule.Form', {
	extend: 'canopsis.lib.view.cform',

	alias: 'widget.ScheduleForm',
	

    initComponent: function(){
		//----------------fieldSet creation-------------------
		this.generalOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('General options'),
			collapsible: false,
		})
		
		this.timeOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('Frequency'),
			collapsible: false,
		})
		
		this.reportOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('Reporting Options'),
			layout: 'hbox',
			collapsible: false,
		})
		
		this.mailingOptions = Ext.widget('fieldset',{
			xtype: 'fieldset',
			title: _('Mailing Options'),
			collapsible: false,
		})
		//-----------------General options----------------------
		
		var TaskName = Ext.widget('textfield',{
				fieldLabel: _('Schedule name'),
				name: 'crecord_name',
				allowBlank: false,
		})
		
		var fonctionCombo = Ext.widget('combobox',{
			fieldLabel: _('Action'),
			name : 'task',
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'task_reporting.render_pdf',
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
			store:  Ext.create('canopsis.store.Views', {autoLoad: true}),
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
					{value: 1, text: _('January')},
					{value: 2, text: _('February')},
					{value: 3, text: _('March')},
					{value: 4, text: _('April')},
					{value: 5, text: _('May')},
					{value: 6, text: _('June')},
					{value: 7, text: _('July')},
					{value: 8, text: _('August')},
					{value: 9, text: _('September')},
					{value: 10, text: _('October')},
					{value: 11, text: _('November')},
					{value: 12, text: _('December')},
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
			disabled: true,
			hidden:true,
			store: {
				xtype: 'store',
				fields: ['value', 'text'],
				data : dayData
			}
		})
		
		var dayWeekCombo = Ext.widget('combobox',{
			name: 'dayWeek',
			fieldLabel: _('Day of week'),
			queryMode: 'local',
			displayField: 'text',
			valueField: 'value',
			value: 'mon',
			disabled: true,
			hidden:true,
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
		
		//alow 24h/12h basis
		var re = /^([01]?\d|2[0-3]):([0-5]\d)(\s)?(am|pm)?$/
		
		//allow only 24h basis
		//var re = /^([01]\d|2[0-3]):?([0-5]\d)$/
		
		var hoursField = Ext.widget('textfield',{
			name: 'hours',
			fieldLabel: _('Hours (local time)'),
			//increment: 15,
			allowBlank: false,
			regex: re,
			//tooltip: _('Enter local time, it will be convert in UTC before sent to server')
			//submitFormat: 'G:i',
		})
		
		//carry the _id for rest service update
		if(this.editing == true){
			var recordId = Ext.widget('textfield',{
				name: '_id',
				allowBlank: false,
				hidden: true,
			})
			this.timeOptions.add(recordId)
		}
			
		this.timeOptions.add([durationCombo,monthCombo,dayWeekCombo,dayCombo,hoursField])
		
		//---------------------------Report option----------------------

		
		var lengthCombo = Ext.widget('combobox',{
			name: 'timeLengthUnit',
			queryMode: 'local',
			displayField: 'text',
			width: 90,
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
		
		//---------------------------Mail option-------------------------
		var checkmail = Ext.widget('checkboxfield',{
			boxLabel  : _('Send by mail'),
			name      : 'sendMail',
		})
		
		var mailRecep = Ext.widget('textfield',{
				fieldLabel: _('To'),
				name: 'recipients',
		})
		
		var mailSubject = Ext.widget('textfield',{
				fieldLabel: _('Subject'),
				name: 'subject',
		})
		
		this.mailingOptions.add(checkmail,mailRecep,mailSubject)
		//-----------------------Binding Events-------------------
		
	
		durationCombo.on('change',function(combo,newValue,oldValue){
			switch(newValue){
				case 'day':
					dayCombo.hide().setDisabled(true)
					dayWeekCombo.hide().setDisabled(true)
					monthCombo.setDisabled(true)
					break;
				case 'week':
					dayCombo.hide().setDisabled(true)
					dayWeekCombo.show().setDisabled(false)
					monthCombo.setDisabled(true)
					break;
				case 'month':
					dayCombo.show().setDisabled(false)
					dayWeekCombo.hide().setDisabled(true)
					monthCombo.setDisabled(true)
					break;
				case 'year':
					dayCombo.show().setDisabled(false)
					dayWeekCombo.hide().setDisabled(true)
					monthCombo.setDisabled(false)
					break;
				default:
					log.debug('Wrong value')
					break;
			}
		},this)
		
		//-----------------------Building------------------------
		this.items = [this.generalOptions,this.timeOptions,this.reportOptions,this.mailingOptions]
        this.callParent();
    },
    
});

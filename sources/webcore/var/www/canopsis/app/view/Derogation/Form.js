
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
Ext.define('canopsis.view.Derogation.Form' , {
	extend: 'canopsis.lib.view.cform',
	
	alias: 'widget.DerogationForm',
	
	width:500,
	layout: 'anchor',
	//bodyStyle:{'background': '#ededed'},
	bodyPadding : 10,
	border:false,
	
	initComponent: function() {
		this.callParent();
		//--------------------standart options--------------------
		this.add({
			xtype: 'textfield',
			name: 'crecord_name',
			fieldLabel: _('Name'),
		})
		
		//--------------------Time Field------------------------
		/*
		this.timeFieldSet = this.add({
			xtype: 'cfieldset',
			title: _('Block update from supervision tools'),
			checkboxName: 'downtime',
			inputValue : true,
			checked : true
		})*/
		
		//----------------Beginning-----------------
		
		this.add({
			xtype:'displayfield',
			value : _('Begging') + ' :',
			margin: '0 0 10 0'
		})
		
		this.add({
			xtype: 'cdate',
			name: 'startTs',
			date_width: 110,
			now:true
		})
		
		//------------------Ending----------------
		this.add({
			xtype:'displayfield',
			value : _('Ending') + ' :',
			margin: '10 0 10 0'
		})
		
		this.periodTypeCombo =  Ext.widget('combobox',{
			isFormField:false,
			editable:false,
			width: 60,
			queryMode: 'local',
			displayField : 'text',
			valueField : 'value',
			value : 'for',
			store: {
				xtype: 'store',
				fields: ['value','text'],
				data: [
					{value: 'for',text:_('For')},
					{value: 'to',text:_('To')},
				]				
			}
		})

		this.forNumber = Ext.widget('numberfield',{
			name : 'for_number',
			width:40,
			value:1,
			minValue: 1,
		})

		this.forPeriodCombo = Ext.widget('combobox',{
			editable:false,
			width:80,
			name: 'for_period',
			queryMode: 'local',
			displayField : 'name',
			valueField : 'value',
			value: global.commonTs.day,
			store: {
				xtype: 'store',
				fields: ['value','name'],
				data: [
					{'name': _('Day'), 'value': global.commonTs.day},
					{'name': _('Week'), 'value': global.commonTs.week},
					{'name': _('Month'), 'value': global.commonTs.month},
					{'name': _('Year'), 'value': global.commonTs.year}
				]			
			}
		})

		this.stopDate = Ext.widget('cdate',{
					name: 'stopTs',
					hidden: true,
					disabled:true
		})

		this.add({
			xtype:'container',
			date_width : 110,
			layout:'hbox',
			items : [this.periodTypeCombo,this.forNumber,this.forPeriodCombo,this.stopDate]
		})
		
		//--------------------Variable field-----------------------
		this.variableField = this.add({
			xtype: 'fieldset',
			title: _('Manual set'),
			items: [Ext.create('derogation.field')]
		})
		
		//align button with other button
		var container = this.variableField.add({
			xtype:  'container',
			margin : '5 0 0 0',
			height: 25,
			layout: 'absolute'
		})

		this.addButton = container.add({
			xtype: 'button',
			x: 436,
			iconCls : 'icon-add',
		})
		
		this.addButton.on('click',function(){
			var last_child_index = this.variableField.items.length
			this.variableField.insert(last_child_index - 1, Ext.create('derogation.field'))
		},this)

		//--------------bindings--------------
		this.periodTypeCombo.on('change',this.toggleTimePeriod,this)
    },

	toggleTimePeriod : function(combo,value){
		if(value == 'for'){
			this.forNumber.show()
			this.forNumber.setDisabled(false)
			this.forPeriodCombo.show()
			this.forPeriodCombo.setDisabled(false)
			this.stopDate.hide()
			this.stopDate.setDisabled(true)
		}

		if(value == 'to'){
			this.forNumber.hide()
			this.forNumber.setDisabled(true)
			this.forPeriodCombo.hide()
			this.forPeriodCombo.setDisabled(true)
			this.stopDate.show()
			this.stopDate.setDisabled(false)
		}

	},
})

Ext.define('derogation.field',{
	extend: 'Ext.form.Panel',
	
	border: false,
	layout:'hbox',
	//bodyStyle:{'background': '#ededed'},
	
	state_icon_path : 'widgets/weather/icons/set1/',
	icon_weather1: '01.png',
	icon_weather2: '05.png',
	icon_weather3: '09.png',
	
	alert_icon_path: 'widgets/weather/icons/public_domain_icon/',
	icon_alert1 : 'workman.png',
	icon_alert2: 'slippery.png',
	icon_alert3: 'alert.png',
	
	icon_class : 'widget-weather-form-icon',
	
	initComponent: function() {
		this.callParent(arguments);
		this.key_field = this.add({
			xtype: 'combobox',
			isFormField:false,
			editable:false,
			flex: 1,
			labelWidth : 35,
			margin : '5 0 0 0',
			fieldLabel: _('Field'),
			queryMode: 'local',
			displayField : 'text',
			valueField : 'value',
			value : 'output_tpl',
			store: {
				xtype: 'store',
				fields: ['value','text'],
				data: [
					{value: 'state',text:_('State')},
					{value: 'output_tpl',text:_('Comment')},
					{value: 'alert_msg', text:_('Alert message')},
					{value: 'alert_icon', text:_('Alert icon')}
				]				
			}
		})
		
		this.list_state = this.add({
			xtype: 'combobox',
			border: false,
			editable:false,
			margin: '5 5 0 15',
			disabled : true,
			hidden:true,
			flex: 1,
			name: 'state',
			displayField : 'text',
			valueField   : 'value',
			queryMode    : 'local',
			value: 0,
			listConfig: {
				getInnerTpl: function() {
					var tpl = '<div>'+
							  '<img src="'+this.state_icon_path+'{icon}" class="'+this.icon_class+'"/>'+
							  '{text}</div>';
					return tpl;
				}.bind(this)
			},
			store: {
				xtype: 'store',
				fields: ['value','text','icon'],
				data: [
					{value: 0,text:_('Ok'),icon: this.icon_weather1 },
					{value: 1,text:_('Warning'),icon: this.icon_weather2 },
					{value: 2, text:_('Critical'),icon: this.icon_weather3 },
				]				
			}
		})
		
		this.alertIcon_radio = this.add({
			xtype: 'combobox',
			border: false,
			editable:false,
			margin: '5 5 0 15',
			disabled : true,
			hidden:true,
			flex: 1,
			name:'alert_icon',
			displayField : 'text',
			valueField   : 'value',
			queryMode    : 'local',
			value: 0,
			listConfig: {
				getInnerTpl: function() {
					var tpl = '<div>'+
							  '<img src="'+this.alert_icon_path+'{icon}" class="'+this.icon_class+'"/>'+
							  '{text}</div>';
					return tpl;
				}.bind(this)
			},
			store: {
				xtype: 'store',
				fields: ['value','text','icon'],
				data: [
					{value: 0,text:_('Indisponible'),icon: this.icon_alert1 },
					{value: 1,text:_('Be carefull'),icon: this.icon_alert2 },
					{value: 2, text:_('Simple alert'),icon: this.icon_alert3 }
				]
			}
		})
		
		this.output_textfield = this.add({
			xtype: 'textfield',
			flex:1,
			name : 'output_tpl',
			emptyText : _('Type here new comment...'),
			margin: '5 5 0 15',
		})
		
		this.alert_textfield = this.add({
			xtype: 'textfield',
			flex:1,
			disabled : true,
			hidden:true,
			name : 'alert_msg',
			emptyText : _('Type here alert message...'),
			margin: '5 5 0 15',
		})
		
		this.destroyButton = this.add({
			xtype : 'button',
			iconCls : 'icon-cancel',
			margin: '5 0 0 0'
		})
		
		//----------------------bind events--------------------
		this.key_field.on('select',this.change,this)
		this.destroyButton.on('click',this.selfDestruction,this)
	},
	
	selfDestruction:function(){
		//tweak, otherwise the textfield is not deleted
		Ext.destroy(this.output_textfield)
		Ext.destroy(this.alert_textfield)
		Ext.destroy(this)
	},
	
	change : function(combo,records,options){
		var value = records[0].get('value')	
		
		if(value == 'output_tpl'){
			this.list_state.hide()
			this.list_state.setDisabled(true)
			this.alert_textfield.hide()
			this.alert_textfield.setDisabled(true)
			this.output_textfield.show()
			this.output_textfield.setDisabled(false)
			this.alertIcon_radio.hide()
			this.alertIcon_radio.setDisabled(true)
		}
		
		if(value == 'alert_msg'){
			this.list_state.hide()
			this.list_state.setDisabled(true)
			this.output_textfield.hide()
			this.output_textfield.setDisabled(true)
			this.alert_textfield.show()
			this.alert_textfield.setDisabled(false)
			this.alertIcon_radio.hide()
			this.alertIcon_radio.setDisabled(true)
		}
		
		if(value == 'alert_icon'){
			this.list_state.hide()
			this.list_state.setDisabled(true)
			this.output_textfield.hide()
			this.output_textfield.setDisabled(true)
			this.alert_textfield.hide()
			this.alert_textfield.setDisabled(true)
			this.alertIcon_radio.show()
			this.alertIcon_radio.setDisabled(false)
		}
		
		if(value == 'state'){
			this.list_state.show()
			this.list_state.setDisabled(false)
			this.output_textfield.hide()
			this.output_textfield.setDisabled(true)
			this.alert_textfield.hide()
			this.alert_textfield.setDisabled(true)
			this.alertIcon_radio.hide()
			this.alertIcon_radio.setDisabled(true)
		}
	},
})


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
	bodyPadding : 10,
	border:false,
	
	initComponent: function() {
		this.callParent();
		
		this.add({
			xtype: 'hiddenfield',
			name: '_id',
			value: undefined
		})
		/*
		var crecord_name = Ext.widget('textfield',{
			name: 'crecord_name',
			fieldLabel: _('Name'),
			width: 295
		})
		*/
		
		var description = Ext.widget('textarea',{
			name: 'description',
			fieldLabel : _('Description'),
			allowBlank:false,
			width : 295
		})
		
		//----------------Beginning-----------------
		
		var beginning = Ext.widget('fieldcontainer',{
			fieldLabel: _('Begging'),
			layout:'hbox',
			items : [{
				xtype: 'cdate',
				name: 'startTs',
				date_width: 110,
				now:true
			}]
		})

		//------------------Ending----------------
		
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

		this.ts_window = Ext.widget('numberfield',{
			name : 'ts_window',
			margin: '0 0 0 5',
			width:40,
			value:1,
			minValue: 1,
		})

		this.ts_unit = Ext.widget('combobox',{
			editable:false,
			width:80,
			margin: '0 0 0 5',
			name: 'ts_unit',
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
			margin: '0 0 0 5',
			hidden: true,
			disabled:true
		})

		var ending = Ext.widget('fieldcontainer',{
			fieldLabel : _('Ending'),
			layout:'hbox',
			items : [this.periodTypeCombo,this.ts_window,this.ts_unit,this.stopDate]
		})
		
		
		//----------------build general options field------------
		
		this.add({
			xtype: 'fieldset',
			title: _('General options'),
			items:[description,beginning,ending]
		})
		
		//--------------------Variable field-----------------------
		this.variableField = this.add({
			xtype: 'fieldset',
			title: _('Manual set'),
		})
		
		if(!this.editing)
			this.variableField.add(Ext.create('derogation.field'))
		
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
		
		this.addButton.on('click',this.addButtonFunc,this)

		//--------------bindings--------------
		this.periodTypeCombo.on('change',this.toggleTimePeriod,this)
    },

	toggleTimePeriod : function(combo,value){
		if(value == 'for'){
			this.ts_window.show()
			this.ts_window.setDisabled(false)
			this.ts_unit.show()
			this.ts_unit.setDisabled(false)
			this.stopDate.hide()
			this.stopDate.setDisabled(true)
		}

		if(value == 'to'){
			this.ts_window.hide()
			this.ts_window.setDisabled(true)
			this.ts_unit.hide()
			this.ts_unit.setDisabled(true)
			this.stopDate.show()
			this.stopDate.setDisabled(false)
		}

	},
	
	addButtonFunc: function(){
		this.addNewField()
	},
	
	addNewField : function(variable,value){
		log.debug(' + Adding a new field',this.logAuthor)
		var last_child_index = this.variableField.items.length
		var config = {
			_variable : variable,
			_value : value
		}
		this.variableField.insert(last_child_index - 1, Ext.create('derogation.field',config))
	}
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
		
		this.key_field = Ext.widget('combobox',{
			isFormField:false,
			editable:false,
			flex: 1,
			labelWidth : 35,
			margin : '5 0 0 0',
			fieldLabel: _('Field'),
			queryMode: 'local',
			displayField : 'text',
			valueField : 'value',
			value : 'output',
			store: {
				xtype: 'store',
				fields: ['value','text'],
				data: [
					{value: 'state',text:_('State')},
					{value: 'output',text:_('Comment')},
					{value: 'alert_msg', text:_('Alert message')},
					{value: 'alert_icon', text:_('Alert icon')}
				]				
			}
		})
		
		this.list_state = Ext.widget('combobox',{
			xtype: 'combobox',
			editable:false,
			margin: '5 5 0 5',
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
		
		this.alertIcon_radio = Ext.widget('combobox',{
			border: false,
			editable:false,
			margin: '5 5 0 5',
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
		
		var config = {
			flex:1,
			name : 'output',
			emptyText : _('Type here new comment...'),
			margin: '5 5 0 5',
		}
		
		//if value, not display comment by default
		if(this._variable && this._value){
			config.disabled = true
			config.hidden = true
		}
		
		this.output_textfield = Ext.widget('textfield',config)
		
		this.alert_textfield = Ext.widget('textfield',{
			flex:1,
			disabled : true,
			hidden:true,
			name : 'alert_msg',
			emptyText : _('Type here alert message...'),
			margin: '5 5 0 5',
		})
		
		this.destroyButton = Ext.widget('button',{
			iconCls : 'icon-cancel',
			margin: '5 0 0 0'
		})
		
		this.items = [this.key_field,
						this.list_state,
						this.alertIcon_radio,
						this.output_textfield,
						this.alert_textfield,
						this.destroyButton]
		
		this.callParent(arguments);
		
		//----------------------bind events--------------------
		this.key_field.on('select',this._onChange,this)
		this.destroyButton.on('click',this.selfDestruction,this)
	},
	
	afterRender : function(){
		this.callParent(arguments);
		if(this._variable){
			this.key_field.setValue(this._variable)
			this.change(this._variable)
			var field = this.down('[name='+this._variable+']');
			if(field)
				field.setValue(this._value)
		}
		
	},
	
	selfDestruction:function(){
		//tweak, otherwise the textfield is not deleted
		Ext.destroy(this.output_textfield)
		Ext.destroy(this.alert_textfield)
		Ext.destroy(this)
	},
	
	_onChange : function(combo,records,options){
		var value = records[0].get('value')	
		this.change(value)
	},
	
	change : function(value){
		if(value == 'output'){
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

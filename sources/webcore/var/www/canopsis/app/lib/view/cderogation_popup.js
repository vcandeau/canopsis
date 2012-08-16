
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
Ext.define('canopsis.lib.view.cderogation_popup' , {
	extend: 'canopsis.lib.view.cpopup',
	alias: 'canopsis.lib.view.cderogation_popup',
	
	alias: 'widget.cderogation',
	
	_component : undefined,
	referer: undefined,
	title : _('Derogation'),
	width:500,
	
	_buildForm : function(){
		
		//--------------------Variable field-----------------------
		this.variableField = this._form.add({
			xtype: 'fieldset',
			title: _('Manual set'),
			items: [Ext.create('derogation.field')]
		})
		
		this.addButton = this.variableField.add({
			xtype:  'button',
			text:'add'
		})
		
		this.addButton.on('click',function(){
			var last_child_index = this.variableField.items.length
			this.variableField.insert(last_child_index - 1, Ext.create('derogation.field'))
		},this)
		
		this._form.add({
			xtype: 'fieldset',
			title: _('Downtime'),
			layout: {
				type: 'vbox',
				align: 'center'
			},
			items: [{
					xtype: 'checkbox',
					boxLabel  : _('Block update from supervision tools'),
					name: 'downtime',
					inputValue : true,
					checked : true,
				},{
					xtype: 'cdate',
					name: 'startTs',
					label_text : _('From')
				},{
					xtype: 'cdate',
					name: 'stopTs',
					label_text : _('To')
				}]
		})
		return this._form
	},
	
	_ok_button_function : function(){
		var output = this._form.getValues()
		
		//get rid of arrays (when user put x times the same field)
		for(var i in output)
			if(Ext.isArray(output[i]))
				output[i] = output[i][0]
		
		log.dump(output)
		//global.selectorCtrl.derogation_on_selector
	}
})

Ext.define('derogation.field',{
	extend: 'Ext.form.Panel',
	//mixins: ['canopsis.lib.form.cfield'],
	
	border: false,
	layout:'hbox',
	bodyStyle:{'background': '#ededed'},
	
	icon_sun: 'widgets/weather/icons/set1/01.png',
	icon_cloud: 'widgets/weather/icons/set1/05.png',
	icon_rain: 'widgets/weather/icons/set1/09.png',
	
	icon_wip : 'widgets/weather/icons/public_domain_icon/workman.png',
	icon_warning: 'widgets/weather/icons/public_domain_icon/slippery.png',
	icon_alert: 'widgets/weather/icons/public_domain_icon/alert.png',
	
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
			listConfig: {
				getInnerTpl: function() {
					var tpl = '<div>'+
							  '<img src="widgets/weather/icons/set1/{icon}" class="widget-weather-form-icon"/>'+
							  '{text}</div>';
					return tpl;
				}
			},
			store: {
				xtype: 'store',
				fields: ['value','text','icon'],
				data: [
					{value: 0,text:_('Ok'),icon: '01.png' },
					{value: 1,text:_('Warning'),icon: '05.png' },
					{value: 2, text:_('Critical'),icon: '09.png' },
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
			listConfig: {
				getInnerTpl: function() {
					var tpl = '<div>'+
							  '<img src="widgets/weather/icons/public_domain_icon/{icon}" class="widget-weather-form-icon"/>'+
							  '{text}</div>';
					return tpl;
				}
			},
			store: {
				xtype: 'store',
				fields: ['value','text','icon'],
				data: [
					{value: 0,text:_('Indisponible'),icon: 'workman.png' },
					{value: 1,text:_('Be carefull'),icon: 'slippery.png' },
					{value: 2, text:_('Simple alert'),icon: 'alert.png' }
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
			text : 'X',
			width : 35,
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

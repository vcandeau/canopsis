
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
	width:300,
	
	icon_sun: 'widgets/weather/icons/set1/01.png',
	icon_cloud: 'widgets/weather/icons/set1/05.png',
	icon_rain: 'widgets/weather/icons/set1/09.png',
	icon_class : 'widget-weather-form-icon',
	
	_buildForm : function(){
		
		this._form.add({
			xtype: 'fieldset',
			defaultType: 'radio',
			title: _('Manual state change'),
			layout: 'anchor',
			items: [
				{
					boxLabel  : '<img src="'+this.icon_sun+'" class="'+this.icon_class+'"/>' + _('Force state to sun'),
					name      : 'state',
					checked   : true,
					anchor : '100%',
					inputValue: '0',
				}, {
					boxLabel  :  '<img src="'+this.icon_cloud+'" class="'+this.icon_class+'"/>' + _('Force state to cloud'),
					anchor : '100%',
					name      : 'state',
					inputValue: '1',
				}, {
					boxLabel  :  '<img src="'+this.icon_rain+'" class="'+this.icon_class+'"/>' + _('Force state to storm'),
					anchor : '100%',
					name      : 'state',
					inputValue: '2',
				}
			]
		})
		
		this._form.add({
			xtype:'displayfield',
			value : _('Visible comment')  + ':'
		})
		
		this._form.add({
			xtype: 'textfield',
			name: 'comment',
			anchor : '100%',
			emptyText : _('Type here new comment...')
		})
		
		this._form.add({
			xtype: 'fieldset',
			title: _('Downtime'),
			layout: {
				type: 'vbox',
				align: 'center'
			},
			items: [{
					xtype: 'checkbox',
					boxLabel  : _('Block state update from supervision tools'),
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
		log.dump(this._form.getValues())
	}
})

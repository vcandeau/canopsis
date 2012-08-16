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

Ext.define('canopsis.lib.form.field.cdate' , {
	extend: 'Ext.container.Container',
	mixins: ['canopsis.lib.form.cfield'],
	
	alias: 'widget.cdate',
	
	layout : {
		type: 'hbox',
		align: 'stretch'
	},
	
	date_label_width : 40,
	date_width : 150,
	hour_width : 75,
	date_value: new Date(),
	max_value : undefined,
	label_text : undefined,
	
	now : false,
	
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']';
		log.debug('Initialize ...', this.logAuthor);
		
		var config = {
			isFormField: false, //upper form does not retrieve this element
			labelWidth:this.date_label_width,
			value:this.date_value,
			editable: false,
			width: this.date_width,
			maxValue : this.max_value,
			allowBlank: false
		}
		
		if(this.label_text)
			config.fieldLabel =  this.label_text
		
		this.date = Ext.widget('datefield',config)
		
		var config = {
			isFormField: false,
			name: 'fromHour',
			margin : '0 0 0 5',
			width: this.hour_width,
			allowBlank: false,
		}
		
		if(this.now)
			config.value = Ext.Date.format(new Date, 'g:i a')
		else
			config.value = '00:00 am'
	
		this.hour = Ext.widget('textfield',config)
	
		this.items = [this.date,this.hour]
	
		this.callParent(arguments);
	},
	
	getValue: function() {
		if(this.date.isValid() && this.hour.isValid()){
			var date = parseInt(Ext.Date.format(this.date.getValue(), 'U'));
			var hour = stringTo24h( this.hour.getValue());
			
			var timestamp = date + (hour.hour * 60 * 60) + (hour.minute * 60);
			return parseInt(timestamp, 10);
		}else {
			log.debug('getTimestamp Invalid', this.logAuthor);
			return undefined
		}
	},
	
	setValue:function(value){
		this.date.setValue(value)
	},
	
	setDisabled : function(bool){
		this.callParent(arguments);
		this.date.setDisabled(bool)
		this.hour.setDisabled(bool)
	}
	
})

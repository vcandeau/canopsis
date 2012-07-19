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

widget_weather_template = Ext.create('Ext.XTemplate',
		'<table class="table">',
			'<tr>',
				'<td class="left_panel">',
					'<div class="first_sub_section">',
						'<p class="title">{title}</p>',
						'<p id="{brick_Component_id}-output" class="comment">{output}</p>',
					'</div>',
				/*	'<div class="second_sub_section">',
						'<tpl if="button_text != undefined">',
							//'<div class="alert_button"><button type="button">{button_text}</button></div>',
							'<button class="alert_button" type="button">{button_text}</button>',
						'</tpl>',
						'<div class="alert_img"></div>',
						'<div class="alert_information"><span>{alert_comment}</span></div>',
					'</div>',*/
				'</td>',
				'<td class="right_panel">',
					'<div id="{brick_Component_id}-icon" class="logo {class_icon}"><p>{percent}%</p></div>',
					'<div id="{brick_Component_id}-legend" class="legend">{legend}</div>',
				'</td>',
			'</tr>',
		'</table',
		{compiled: true}
	);

Ext.define('widgets.weather.brick' , {
	extend: 'Ext.Component',
	alias: 'widget.weather.brick',
	
	logAuthor: '[widget][weather][brick]',
	
	sla_id: undefined,
	
	initComponent: function() {
		log.debug('Initialize with sla: ' + this.sla_id,this.logAuthor)
		this.callParent(arguments);
		this.getSla(this.build);
	},
	
	//get sla data and give it to callback function
	getSla : function(callback){
		Ext.Ajax.request({
			url: '/rest/events/event/' + this.sla_id,
			scope: this,
			success: function(response) {
				var data = Ext.JSON.decode(response.responseText);
				data = data.data[0];
				callback.call(this,data);
			},
			failure: function(result, request) {
				log.error('Impossible to get Node informations, Ajax request failed ... ('+ request.url + ')', this.logAuthor);
			}
		});
	},
	
	//here for the future, for another update function
	update_brick : function(){
		this.getSla(this.build)
	},
	
	build: function(data){
		log.debug('Build html for ' + this.sla_id,this.logAuthor)
		var widget_data = {}
		
		widget_data.title = data.component
		widget_data.legend = rdr_elapsed_time(data.last_state_change)
		//widget_data.alert_comment = '0:00am to 9:00am'
		widget_data.percent = data.perf_data_array[0].value

		if(data.output && data.output != "")
			widget_data.output = data.output

		if(this.state_as_icon_value){
			var icon_value = 100 - ( data.state / 4 * 100)
			widget_data.class_icon = this.getIcon(icon_value)
		}else{
			if(data.perf_data_array[0])
				widget_data.class_icon = this.getIcon(data.perf_data_array[0].value)
		}
	
		if(this.option_button == true)
			widget_data.button_text = _('Report issue')
			
		widget_data.brick_Component_id = this.id
		
		var _html = widget_weather_template.applyTemplate(widget_data);
		this.getEl().update(_html)
		
		//this.getElements()
	},
/*
	getElements: function() {
		var el = this.getEl();
		this.el_logo = el.getById(this.id + '-icon')
		this.el_logo_percent = 
		this.el_legend = el.getById(this.id + '-legend')
		this.el_ouput = el.getById(this.id + '-output')
	},
	**/

	getIcon: function(value){
		value = Math.floor(value/10) *10
		switch(value){
			case 0:
				return 'iconSet' + this.iconSet + '_' + '0-10'
				break;
			case 10:
				return 'iconSet' + this.iconSet + '_' + '10-20'
				break;
			case 20:
				return 'iconSet' + this.iconSet + '_' + '20-30'
				break;
			case 30:
				return 'iconSet' + this.iconSet + '_' + '30-40'
				break;
			case 40:
				return 'iconSet' + this.iconSet + '_' + '40-50'
				break;
			case 50:
				return 'iconSet' + this.iconSet + '_' + '50-60'
				break;
			case 60:
				return 'iconSet' + this.iconSet + '_' + '60-70'
				break;
			case 70:
				return 'iconSet' + this.iconSet + '_' + '70-80'
				break;
			case 80:
				return 'iconSet' + this.iconSet + '_' + '80-90'
				break;
			case 90:
				return 'iconSet' + this.iconSet + '_' + '90-100'
				break;
			case 100:
				return 'iconSet' + this.iconSet + '_' + '90-100'
				break;
			default:
				return undefined
				break;
		}
	}

});

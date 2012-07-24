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
					'<div class="logo {class_icon}">',
						'<tpl if="percent != undefined ">',
							'<p>{percent}%</p>',
						'</tpl>',
					'</div>',
					'<div class="legend">{legend}</div>',
				'</td>',
			'</tr>',
		'</table',
		{compiled: true}
	);

Ext.define('widgets.weather.brick' , {
	extend: 'Ext.Component',
	alias: 'widget.weather.brick',
	
	logAuthor: '[widget][weather][brick]',
	
	brick_number: undefined,
	iconSet: 1,
	state_as_icon_value: false,
	bg_impair_color: '#FFFFF',
	bg_pair_color:  '#FFFFF',
	
	data : undefined,
	nodeId : undefined,
	component_name : undefined,
	
	initComponent: function() {
		log.debug('Initialize with sla: ' + this.sla_id,this.logAuthor)
		
		this.style = {'background-color': this.bg_color}
		
		this.callParent(arguments);
	},
	
	afterRender : function(){
		log.debug(' + Build html..',this.logAuthor)
		if(this.data){
			this.component_name = this.data.component
			this.build(this.data)
		}else{
			this.buildEmpty()
		}
	},
	
	build: function(data){
		log.debug('Build html for ' + data._id,this.logAuthor)
		var widget_data = {}
		
		widget_data.title = this.component_name
		widget_data.legend = rdr_elapsed_time(data.last_state_change,true)
		//widget_data.alert_comment = '0:00am to 9:00am'

		if(data.output && data.output != "")
			widget_data.output = data.output

		if(this.state_as_icon_value || data.event_type == "selector"){
			var icon_value = 100 - ( data.state / 4 * 100)
			widget_data.class_icon = this.getIcon(icon_value)
		}else{
			if(data.perf_data_array[0]){
				widget_data.percent = data.perf_data_array[0].value
				widget_data.class_icon = this.getIcon(data.perf_data_array[0].value)
			}
		}
	
		/*
		if(this.option_button == true)
			widget_data.button_text = _('Report issue')
			* */
		
		var _html = widget_weather_template.applyTemplate(widget_data);
		this.getEl().update(_html)
	},
	
	
	buildReport : function(data){
		log.debug('Build html for ' + this.source_id,this.logAuthor)
		
		var widget_data = {}
		widget_data.title = this.component_name
		
		if(data){
			var timestamp = data.values[0][0]
			if(this.data.event_type == "selector"){
				var state = parseInt(data.values[0][1].toString()[0]) //first digit of cps_state
				log.debug('State of ' + this.source_id + ' is: ' + state,this.logAuthor)
				var icon_value = 100 - ( state / 4 * 100)
				widget_data.class_icon = this.getIcon(icon_value)
				widget_data.output = _('State on ' + rdr_tstodate(timestamp/1000))
			}else{
				var cps_pct_by_state_0 = data.values[0][1]
				widget_data.percent = cps_pct_by_state_0
				widget_data.class_icon = this.getIcon(cps_pct_by_state_0)
				widget_data.output = _('SLA on ' + rdr_tstodate(timestamp/1000))
			}
		} else {
			widget_data.class_icon = 'widget-weather-icon-info'
			widget_data.output = _('No data available')
		}
		
		var _html = widget_weather_template.applyTemplate(widget_data);
		this.getEl().update(_html)
	},
	
	buildEmpty: function(){
		var widget_data = {
			title : this.component_name,
			output : _("This selector doesn't have an SLA"),
			class_icon : 'widget-weather-icon-info'
		}

		var _html = widget_weather_template.applyTemplate(widget_data);
		this.getEl().update(_html)
	},

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

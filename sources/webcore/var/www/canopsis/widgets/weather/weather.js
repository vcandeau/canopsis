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
						'<p class="comment">{output}</p>',
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
					'<div class="logo {class_icon}"><p>{percent}%</p></div>',
					'<div class="legend">{legend}</div>',
				'</td>',
			'</tr>',
		'</table',
		{compiled: true}
	);

Ext.define('widgets.weather.weather' , {
	extend: 'canopsis.lib.view.cwidget',

	alias: 'widget.weather',
	logAuthor: '[widget][weather]',
	border: false,
	
	cls: 'widget-weather',
	
	iconSet : '01',
	state_as_icon_value : false,
	
	option_button : true,
	
	selector_record : undefined,
	
	initComponent: function() {
		log.debug('Initialize...' , this.logAuthor)
		this.callParent(arguments);
	},

	build : function(data){
		if(data.event_type == 'sla'){	
			//build data
			var widget_data = {}
			
			widget_data.title = data.component
			widget_data.legend = rdr_elapsed_time(data.last_state_change)
			widget_data.alert_comment = '0:00am to 9:00am'
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
			
			var _html = widget_weather_template.applyTemplate(widget_data);
			this.wcontainer.update(_html)

		} else {
			this.wcontainer.update('invalid selector')
		}
	},
	
	onRefresh : function(data){
		log.debug('OnRefresh', this.logAuthor)
		
		this.selector_record = data
		
		sla_id = 'sla.engine.sla.resource.' + data.component + '.sla'
		log.debug('Searching sla resource: ' + sla_id, this.logAuthor)
		
		Ext.Ajax.request({
			url: '/rest/events/event/' + sla_id,
			scope: this,
			success: function(response) {
				var data = Ext.JSON.decode(response.responseText);
				if ( this.nodeId.length > 1 )
					data = data.data ;
				else
					data = data.data[0];
		
				this.build(data);
			},
			failure: function(result, request) {
				log.error('Impossible to get Node informations, Ajax request failed ... ('+ request.url + ')', this.logAuthor);
			}
		});
		
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

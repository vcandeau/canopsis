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
					'<p class="title">{title}</p>',
					'<p class="comment">{output}</p>',
					'<div class="alert_panel">',
						'<tpl if="button_text != undefined">',
							'<div class="alert_button"><button type="button">{button_text}</button></div>',
						'</tpl>',
						'<div class="alert_img"></div>',
						'<div class="alert_information"><span>{alert_comment}</span></div>',
					'</div>',
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
	
	option_button : true,
	
	initComponent: function() {
		log.debug('Initialize...' , this.logAuthor)
		this.callParent(arguments);
	},
	
	build : function(data){
		var _html = widget_weather_template.applyTemplate(data);
		this.wcontainer.update(_html)
		return _html
	},
	
	onRefresh : function(data){
		if(data.event_type == 'sla'){	
			//build data
			var widget_data = {}
			
			widget_data.title = data.component
			widget_data.output = data.output
			widget_data.legend = rdr_tstodate(data.timestamp)
			widget_data.percent = data.perf_data_array[0].value
			widget_data.class_icon = this.getIcon(widget_data.percent)
			
			if(this.option_button == true)
				widget_data.button_text = _('Report an issue')
				
			widget_data.alert_comment = 'This component will be shut down from 0:00am to 9:00am'
			
			this.build(widget_data)
		} else {
			this.wcontainer.update('invalid selector')
		}
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
		}
	}
	
	
});

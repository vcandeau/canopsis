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
widget_weather_template = new Ext.Template(
		'<table class="table">',
			'<tr>',
				'<td class="left_panel">',
					'<p class="title">title</p>',
					'<p class="comment">comment</p>',
					'<div class="alert_panel">',
						'<div>button</div>',
						'<div><img src=""/></div>',
						'<div><span>alert comment</span></div>',
					'</div>',
				'</td>',
				'<td class="right_panel">',
					'<div class="logo">logo</div>',
					'<div class="legend">text</div>',
				'</td>',
			'</tr>',
		'</table',
		{
			compiled: true,      // compile immediately
		}
	);

Ext.define('widgets.weather.weather' , {
	extend: 'canopsis.lib.view.cwidget',

	alias: 'widget.weather',
	logAuthor: '[widget][weather]',
	
	_template : undefined,
	
	cls: 'widget-weather',
	
	initComponent: function() {
		log.debug('Initialize...' , this.logAuthor)
		/*
		this.inner_component = Ext.create('Ext.Component',{
			html : this.build()
		})*/

		this.callParent(arguments);

	},
	
	afterContainerRender: function() {
		//this.wcontainer.removeAll()
		this.wcontainer.update(this.build())
	},
	
	build : function(){
		return widget_weather_template.applyTemplate();
	}
	
});

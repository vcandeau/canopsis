
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

Ext.define('widgets.weather.report_popup' , {
	extend: 'canopsis.lib.view.cpopup',
	alias: 'widget.weather.report_popup',
	
	_component : undefined,
	referer: undefined,
	width:300,
	
	base_event: {
		'connector_name': 'widget-weather',
		'connector': 'Canopsis',
		'event_type': 'log',
		'source_type': 'resource',
		'component': undefined,
		'resource': 'user_problem',
		'referer': undefined,
		'author': global.account.firstname + ' ' + global.account.lastname,
		'state': 1,
		'state_type':1,
		'output':'',
	},
	
	ok_button_function: function(){
		log.debug('Send Event',this.logAuthor)
		var event = Ext.clone(this.base_event)
		event.output = this.input_textArea.getValue()
		
		if(this._component)
			event.component = this._component
		if(this.referer)
			event.referer = this.referer
			
		log.dump(event)
		
		global.eventsCtrl.sendEvent(event)
		this.close()
	}
})

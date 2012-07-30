
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
	
	base_event: {
	  'connector':         'Canopsis',
	  'connector_name':    'Interface',
	  'event_type':        'log',
	  'source_type':       'resource',
	  //'component':         this._component,
	  'resource':          'user_problem',
	  'state':             2,
	  'state_type':        1,
	  //'output':            '',
	},
	
	ok_button_function: function(){
		log.debug('Send Event',this.logAuthor)
		var event = Ext.clone(this.base_event)
		event.output = this.input_textArea.getValue()
		event.component = this._component
		global.eventsCtrl.sendEvent(event)
		this.close()
	}
})

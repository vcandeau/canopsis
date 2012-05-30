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
Ext.define('canopsis.controller.Events', {
	extend: 'Ext.app.Controller',

	logAuthor: '[controller][Events]',

	init: function() {
		log.debug('Initialize ...',this.logAuthor);

		this.callParent(arguments);
		
		global.eventsCtrl = this
	},

	sendEvent: function(event){
		log.debug('Prepare to send events',this.logAuthor)
		
		Ext.Ajax.request({
			url: '/event/',
			method: 'POST',
			params: event,
			scope: this,
			success: function(response){
				var text = response.responseText;
				global.notify.notify(_('Success'),_('Event successfuly sent'))
				//close the window
			},
			failure : function(response){
				
				if(response.status == 403){
					global.notify.notify(_('Access denied'),_('You don\'t have the rights to modify this object'),'error')
					log.error(_('Access denied'))
				} else {
					log.error(_('Updating rights have failed'),this.logAuthor)
				}
			}
		});
		
	}

})

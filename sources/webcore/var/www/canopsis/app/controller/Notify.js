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
Ext.define('canopsis.controller.Notify', {
    extend: 'Ext.app.Controller',

    opacity: 0.8,
    history: false,
    views: [],

    init: function() {
	this.getController('WebSocket').on('message', function(ws, evt, data) {
		
		var type = undefined;
		var icon = undefined;
		var title = data['connector_name'] + " > " +  data['component'];
		var message = data['output'];

		if (data['source_type'] == 'ressource') {
			title = title + " > " + data['ressource']
		}

		if (data['state'] == 0){
			icon = 'ui-icon ui-icon-check'
		}else if (data['state'] == 1) {
			icon = 'ui-icon ui-icon-alert'
		}else if (data['state'] == 2){
			type = 'error'
		}

		this.notify(title, message, type, icon);
	}, this);

    },

    notify: function(title, text, type, icon){
	if (global.notify){
		$.pnotify({
			pnotify_title: title,
			pnotify_text: text,
			pnotify_type: type,
			pnotify_history: this.history,
			pnotify_notice_icon: icon,
			pnotify_opacity: this.opacity,
		});
	}
   }
});

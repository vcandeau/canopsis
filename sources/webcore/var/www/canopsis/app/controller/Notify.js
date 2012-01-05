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

    init: function() {
		global.notify = this
		log.debug('[controller][cnotify] - Initialize ...');
		this.callParent(arguments);
    },

    notify: function(title, text, type, icon,hide,closer,sticker){
		if(type == undefined){var type=undefined}
		if(icon == undefined){var icon=undefined}
		if(hide == undefined){var hide=true}
		if(closer == undefined){var closer=true}
		if(sticker == undefined){var sticker=false}
		$.pnotify({
			pnotify_title: title,
			pnotify_text: text,
			pnotify_type: type,
			pnotify_history: this.history,
			pnotify_notice_icon: icon,
			pnotify_opacity: this.opacity,
			pnotify_hide: hide,
			pnotify_closer: closer,
			pnotify_sticker: sticker
		})
		log.debug('[controller][cnotify] - Display notify');
	}
});

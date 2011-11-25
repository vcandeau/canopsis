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
Ext.define('canopsis.controller.WebSocket', {
    extend: 'Ext.app.Controller',

    views: [],
    stores: [],

    autoconnect: true,
    ws_enable: true,
    open: false,
    ws: false,

    init: function() {
	if (!window.WebSocket) {
		if (window.MozWebSocket) {
			window.WebSocket = window.MozWebSocket;
		} else {
			ws_enable = false;
		}
	}

	var location = document.location.host;
	var host = location.split(":")
	host = host[0]
	this.ws_url = "ws://"+host+":8090";

	if (this.autoconnect){
		this.connect();
	}
    },

    connect: function() {
	if (this.ws_enable) {
		log.debug("Connect Websocket  to '"+this.ws_url+"'...")
		this.ws = new WebSocket(this.ws_url);
		this.ws.extctrl = this
		this.ws.onopen = this.ws_onopen;
		this.ws.onclose = this.ws_onclose;
		this.ws.onmessage = this.ws_onmessage;
	}
    },

    ws_onopen: function(evt) {
	log.debug("Websocket Connected.")
	this.open = true;
	this.extctrl.fireEvent('open', this, evt);
    },
    ws_onclose: function(evt) {
	log.debug("Websocket Closed.")
	this.open = false;
	this.extctrl.fireEvent('close', this, evt);
    },
    ws_onmessage: function(evt) {
	//log.debug("New message from Websocket ...")
	var data = Ext.JSON.decode(evt.data);
	this.extctrl.fireEvent('message', this, evt, data);
    },

});

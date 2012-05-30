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
Ext.define('canopsis.controller.Websocket', {
    extend: 'Ext.app.Controller',

    views: [],
    stores: [],
    
	logAuthor: "[controller][Websocket]",
	
    autoconnect: true,
    faye_port: 8085,
    faye_mount: "/",

    init: function() {
		var location = document.location.host;
		var host = location.split(":")
		host = host[0]
		this.faye_uri = "http://"+host+":"+this.faye_port+this.faye_mount;

		if (this.autoconnect){
			this.connect();
		}
    },

    connect: function() {
		log.debug("Connect Websocket  to '"+this.faye_uri+"'...", this.logAuthor)
		
		this.faye_client = new Faye.Client(this.faye_uri);
		this.faye_client.addExtension(this.faye_auth);
		
		// Suscribe to channel
		this.faye_subscription = this.faye_client.subscribe(this.faye_mount+"ui", function(raw) {
			log.dump(raw);
		});

		// On connect
		this.faye_subscription.callback(function() {
			log.debug("Subscibed.", "[controller][Websocket]");
		});

		// On error
		this.faye_subscription.errback(function(error) {
			log.error("Error when subscribe to channel", "[controller][Websocket]");
			log.error(error);
		});

    },
    
    faye_auth: {
		outgoing: function(message, callback) {
			// Again, leave non-subscribe messages alone
			if (message.channel !== '/meta/subscribe')
				return callback(message);

			// Add ext field if it's not present
			if (!message.ext) message.ext = {};
	
			// Set the auth token
			message.ext.authToken = global.account.authkey;
			message.ext.authId = global.account._id;

			// Carry on and send the message to the server
			callback(message);
		}
	},

});

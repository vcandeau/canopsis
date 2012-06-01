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
    
    connected: false,

    init: function() {
		var location = document.location.host;
		var host = location.split(":")
		host = host[0]
		this.faye_uri = "http://"+host+":"+this.faye_port+this.faye_mount;

		if (this.autoconnect){
			this.connect();
		}
		
		global.websocketCtrl = this;
    },
    
    faye_auth: {
		outgoing: function(message, callback) {
			// Again, leave non-subscribe messages alone
			if (message.channel !== '/meta/subscribe')
				return callback(message);

			// Add ext field if it's not present
			if (!message.ext) message.ext = {};
	
			// Set the auth token
			//TODO: Hash token
			message.ext.authToken = global.account.authkey;
			message.ext.authId = global.account._id;

			// Carry on and send the message to the server
			callback(message);
		}
	},

    connect: function() {
		log.debug("Connect Websocket  to '"+this.faye_uri+"'...", this.logAuthor)
		
		this.faye_client = new Faye.Client(this.faye_uri);
		this.faye_client.addExtension(this.faye_auth);
		
		this.faye_client.bind('transport:down', function() {
			me = global.websocketCtrl;
			me.connected = false;
			log.error("Transport Down", me.logAuthor);
			me.fireEvent('transport_down', me);
		});
		
		this.faye_client.bind('transport:up', function() {
			me = global.websocketCtrl;
			me.connected = true;
			log.debug("Transport Up", me.logAuthor);
			me.fireEvent('transport_up', me);
		});
		
		//this.subscribe(this.faye_mount+"ui/"+global.account._id, this.on_pv)
		this.subscribe(this.faye_mount+"ui/events", this.on_event)
		
    },
    
    log_error: function(err){
		me = global.websocketCtrl
		log.error("Faye: "+err.code + ": "+err.message, me.logAuthor);
	},
    
    subscribe: function(channel, on_message){
		channel = channel.replace("\.", "~");
		
		var subscription = this.faye_client.subscribe(channel, on_message);
		
		// On subscribe
		subscription.callback(function() {
			var me = global.websocketCtrl
			log.debug("Subscribed to '"+channel+"'.", me.logAuthor);
			me.fireEvent('subscribe', me, channel);
		});

		// On error
		subscription.errback(function(error) {
			var me = global.websocketCtrl
			log.error("Error when subscribe to channel '"+channel+"'", me.logAuthor);
			me.log_error(error);
		});
	},
	
	publish_event: function(type, id, name){
		this.faye_client.publish(this.faye_mount+"ui/events",{
			author: global.account._id,
			clientId: this.faye_client.getClientId(),
			type: type,
			id: id,
			name: name,
			timestamp: get_timestamp_utc()
		});
	},
	
	on_event: function(raw){
		var me = global.websocketCtrl
		if (raw.clientId != me.faye_client.getClientId()){
			log.debug(raw.author+" "+raw.name+" "+raw.type+" "+raw.id, me.logAuthor)
		}
	},
	
	on_pv: function(raw){
		var me = global.websocketCtrl
		var me = global.websocketCtrl
		if (raw.clientId != me.faye_client.getClientId()){
			log.debug("PV: "+raw.author+": "+raw.message, me.logAuthor);
		}
	}

});

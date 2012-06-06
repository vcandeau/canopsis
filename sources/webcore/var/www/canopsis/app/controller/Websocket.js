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
    connected: false,

    init: function() {
		global.websocketCtrl = this;
		
		if (this.autoconnect){
			this.connect();
		}
    },
 
    connect: function() {
		log.debug("Connect Websocket ...", this.logAuthor)

		if (typeof(now)=='undefined'){
			log.error("Impossible to load NowJS Client.", this.logAuthor)
			return
		}
		
		now.authToken = global.account.authkey;
		now.authId = global.account._id;

		now.ready(function(){
			var me = global.websocketCtrl
			
			now.core.socketio.on('disconnect', function(){
				me.connected = false;
				me.fireEvent('transport_down', me);
			})
			
			
			log.debug(" + Connected", me.logAuthor)
			
			now.auth(function(){
				log.debug(" + Authed", me.logAuthor)
				
				me.connected = true
				me.fireEvent('transport_up', me);
				
				//me.subscribe('ui', 'events', me.on_event);
			});
			
		});		
    },
    
    subscribe: function(type, channel, on_message){
		now.subscribe(type, channel, function(){
			cosole.log(this)
			//on_message
		})
	},

    unsubscribe: function(type, channel){
		now.unsubscribe(type, channel)
	},
	
	publish_event: function(type, id, name){
		/*this.faye_client.publish(this.faye_mount+"ui/events",{
			author: global.account._id,
			clientId: this.faye_client.getClientId(),
			type: type,
			id: id,
			name: name,
			timestamp: get_timestamp_utc()
		});*/
	},
	
	on_event: function(raw){
		var me = global.websocketCtrl
		console.log(raw)
		/*if (raw.clientId != me.faye_client.getClientId()){
			log.debug(raw.author+" "+raw.name+" "+raw.type+" "+raw.id, me.logAuthor)
		}*/
	},
	
	on_pv: function(raw){
		/*var me = global.websocketCtrl
		var me = global.websocketCtrl
		if (raw.clientId != me.faye_client.getClientId()){
			log.debug("PV: "+raw.author+": "+raw.message, me.logAuthor);
		}*/
	}

});

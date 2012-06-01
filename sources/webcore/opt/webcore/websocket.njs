#!/usr/bin/env node
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

//####################################################
//# Default Configurations
//####################################################

var default_config = {
	amqp: {},
	faye: { port: 8085, debug: false, amqp_timeout: 10},
	mongodb: {}
};

//####################################################
//#  Logging
//####################################################

var log = {
	info:		function(message, author){
		this.print(this.date()+' INFO '+author+' '+message)
	},
	debug:		function(message, author){
		if (config.faye.debug)
			this.print(this.date()+' DEBUG '+author+' '+message)
	},
	warning:	function(message, author){
		this.print(this.date()+' WARN '+author+' '+message)
	},
	error:		function(message, author){
		this.print(this.date()+' ERR '+author+' '+message)
	},
	dump: 		function(message){
		if (config.faye.debug)
			console.log(message)
	},
	print: 		function(message){
		console.log(message)
	},
	date:		function(){
		var date = new Date()
		return date
	}
};

//####################################################
//#  Extend object (http://onemoredigit.com/post/1527191998/extending-objects-in-node-js)
//####################################################
Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
            if (name in dest) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
            }else{
				// Hack
				dest[name] = Object.getOwnPropertyDescriptor(from, name).value;
			}
        });
        return this;
    }
});

//####################################################
//#  Load Module
//####################################################

log.info("Load modules ...", "main")
try {
	var mongodb = require('mongodb');
	var faye   = require('faye');
	var amqp   = require('amqp');
	var util   = require('util');
	var iniparser = require('iniparser');
	
} catch (err) {
	log.error("Impossible to load modules", "main")
	log.dump(err)
	process.exit(1);
}
log.info(" + Ok", "main")


//####################################################
//#  Load Configurations
//####################################################

//GLOBAL
var config = {};
	
var read_config = function(callback){
	
	log.info("Read configuration's file ...", "config")
	
	var read_config_ini = function(file, field, section, callback){
		log.info(" + Read "+file+"...", "config")
		
		iniparser.parse(file, function(err, data){
			if (err) {
				log.error(err, "config");
				process.exit(1);
			} else {
				config[field] = default_config[field].extend(data[section])
				log.info("   + Ok", "config")
				callback()
			}
		});	
	}
	
	// MongoDB
	read_config_ini(process.env.HOME+'/etc/cstorage.conf', "mongodb", "master", function(){
		// AMQP
		read_config_ini(process.env.HOME+'/etc/amqp.conf', "amqp", "master", function(){
			// FAYE
			read_config_ini(process.env.HOME+'/etc/webserver.conf', "faye", "faye", function(){
				//Main Callback
				log.info(" + Ok", "config")
				callback(config)
			});
		});
	});
}

//####################################################
//#  Connect to MongoDB
//####################################################

//GLOBAL
var mongodb_server = undefined
var mongodb_client = undefined
var mongodb_collection_object = undefined

var init_mongo = function(callback){
	log.info("Connect to MongoDB ...", "mongodb")
	mongodb_server = new mongodb.Server(config.mongodb.host, parseInt(config.mongodb.port), {})
	mongodb_client = new mongodb.Db(config.mongodb.db, mongodb_server);
	mongodb_collection_object = undefined

	mongodb_client.open(function(err, p_client) {
		if (err) {
			log.error(err, "mongodb");
		} else {
			log.info(" + Ok", "mongodb")
			mongodb_collection_object = new mongodb.Collection(mongodb_client, 'object');
			callback()
		}
	});
}


//####################################################
//#  Connect to AMQP Broker
//####################################################

//GLOBAL
var amqp_connection = undefined

var init_amqp = function(callback){
	log.info("Connect to AMQP Broker ...", "amqp")
	
	amqp_connection = amqp.createConnection({
		host: config.amqp.host,
		port: config.amqp.port,
		vhost: config.amqp.virtual_host
	});

	amqp_connection.addListener('ready', function(){
		log.info(" + Connected", "amqp");
		callback();
	});	
}


//####################################################
//#  Bind AMQP Queue on Faye channel
//####################################################

//GLOBAL
var amqp_queues = {};

var amqp_subscribe_queue = function(faye_channel){
	var queue_name = faye_channel.split("/")[2];
	queue_name = 'websocket_'+queue_name
	log.info("Create Queue '"+queue_name+"'", "amqp")
	if (! amqp_queues[queue_name]){
		var queue = amqp_connection.queue(queue_name, {durable: false, exclusive: true}, function(){
			log.debug(" + Ok", "amqp")
				
			log.debug("Subscribe Queue '"+queue_name+"'", "amqp")
			this.subscribe( {ack:true}, function(message){
				if (faye_sessions.nbClientByChannel(faye_channel)){
					//Publish message to Faye channel
					faye_server.getClient().publish(faye_channel, message);
				}
				queue.shift()
			});
			
			log.debug("Bind '#' on '"+queue_name+"'", "amqp")
			this.bind("canopsis.events", "#");
			this.on('queueBindOk', function() { log.debug(" + Ok", "amqp") });
			
			amqp_queues[queue_name] = this;	
		});
	}else{
		log.info(" + Already exist", "amqp")
	}
}

var amqp_unsubscribe_queue = function(faye_channel){
	var queue_name = faye_channel.split("/")[2];
	queue_name = 'websocket_'+queue_name
	log.debug("Close AMQP queue '" + queue_name + "'", "amqp")
	var queue = amqp_queues[queue_name]
	queue.destroy()
	delete amqp_queues[queue_name];
}

//####################################################
//#  Start Faye Server
//####################################################

var faye_sessions = {
	sessions: {},
	channels: {},
	
	create: function(id, extra){
		if (this.check(id))
			return
		
		if (extra == undefined)
			extra = true
			
		log.debug("Create session "+id+" ("+extra+")", "session")
		this.sessions[id] = extra
	},
	
	drop: function(id){
		log.debug("Drop session "+id+" ("+this.sessions[id]+")", "session")
		delete this.sessions[id]
	},
	
	check: function(id){
		if (id == faye_server.getClient().getClientId())
			return "faye.server"
			
		return this.sessions[id]
	},
	
	subscribe: function(id, channel){
		if (! this.channels[channel])
			this.channels[channel] = [ id ]
		else
			this.channels[channel].push(id)
	},
	
	unsubscribe: function(id, channel){
		var channels = this.channels[channel]
		var index = channels.indexOf(id)
		this.channels[channel] = channels.slice(0,index).concat(channels.slice(index+1, channels.length))
	},
	
	nbClientByChannel: function(channel){
		return this.channels[channel].length
	}
}

var init_faye = function(callback){
	
	var faye_check_authToken = function (clientId, authId, authToken, faye_callback, faye_message){

		if (mongodb_collection_object) {				
			mongodb_collection_object.findOne({'_id': authId}, function(err, record){
				
				log.info("Try to auth "+authId+" ("+clientId+") ...", "faye");
				if (err) {
					log.error(err, "mongodb");
				} else {
					if (record.authkey == authToken){
						log.info(" + Auth Ok", "faye")
						faye_sessions.create(clientId, authId)
					} else {
						log.info(clientId + ": Invalid auth (authId: '"+authId+"')", "faye");
						faye_message.error = 'Invalid auth';
					}
					
					//Check if is AMQP Channel
					if (! faye_message.error && faye_message.subscription.split("/")[1] == "amqp"){
						log.debug("Okay, it's AMQP channel", "faye")
						amqp_subscribe_queue(faye_message.subscription)
					}
					
					faye_callback(faye_message);
				}
			});
		}else{
			log.warning("MongoDB not ready.", "faye");
		}
	};

	var faye_auth = {
		incoming: function(message, callback) {
			var clientId =  message.clientId
			
			if (message.channel == '/meta/handshake' || message.channel == '/meta/disconnect' || message.channel == '/meta/connect')
				return callback(message);
			
			if (message.channel == '/meta/subscribe' && ! faye_sessions.check(clientId)) {
				try {
					// Check auth and open session
					//TODO: Hash token
					var authToken = message.ext.authToken;
					var authId = message.ext.authId;
					
					faye_check_authToken(clientId, authId, authToken, callback, message)
					return
					
				} catch (err) {
					log.error(clientId + ": Impossible to subscribe, please set auth informations...", "faye");
					log.dump(err);
				}
			};
			
			// Check sessions and self message
			if (! faye_sessions.check(clientId)){
				log.error(clientId + ": Invalid session, please auth ...", "faye")
				message.error = 'Invalid session, please auth ...';
			}
			
			callback(message);
		}
	};


	log.info("Start Faye servers", "faye")
	faye_server = new faye.NodeAdapter({mount: '/'});
	

	// Bind Faye events

	// Bind handshake event
	faye_server.bind('handshake', function(clientId) {
		log.debug(clientId+': Connected', "faye")
	})
	
	// Bind disconnect event
	faye_server.bind('disconnect', function(clientId) {
		log.debug(faye_sessions.check(clientId)+': Disconnected', "faye")
		// Clean sessions
		try {
			faye_sessions.drop(clientId)
		} catch (err) {
			log.error("Invalid session for " + clientId, "faye");
		}
	})

	// Bind subscribe event
	faye_server.bind('subscribe', function(clientId, channel) {
		faye_sessions.subscribe(clientId, channel)
		log.info(faye_sessions.check(clientId)+': Suscribe to '+channel+" ("+faye_sessions.nbClientByChannel(channel)+")", "faye")
	})

	// Bind unsubscribe event
	faye_server.bind('unsubscribe', function(clientId, channel) {
		faye_sessions.unsubscribe(clientId, channel)
		var nb_clients = faye_sessions.nbClientByChannel(channel)
		
		log.info(faye_sessions.check(clientId)+': Unsuscribe to '+channel+" ("+nb_clients+")", "faye")
		
		// Close AMQP Queue if nobody connect in next 'config.faye.amqp_timeout' seconds
		if (nb_clients == 0 && channel.split("/")[1] == "amqp" ){
			log.debug(" + Nobody in AMQP Channel, close this AMQP Queue in "+config.faye.amqp_timeout+" sec ...", "faye")
			setTimeout(function(channel){
				if (! faye_sessions.nbClientByChannel(channel))
					amqp_unsubscribe_queue(channel)
			}, parseInt(config.faye.amqp_timeout)*1000, channel);
		}
	})

	// Extend faye_server
	faye_server.addExtension(faye_auth);

	// Wait Client
	log.info(" + Listen on "+config.faye.port, "faye")
	faye_server.listen(parseInt(config.faye.port), {}, function(){
		log.info("   + Ok", "faye");
		callback();
	});
}

//####################################################
//#  Main Program
//####################################################

read_config(function(){
	log.debug("Configurations:", "main")
	config.faye.debug = (config.faye.debug === 'true')
	
	log.dump(config)
	
	init_mongo(function(){
		init_amqp(function(){
			init_faye(function(){
				log.info("Initialization completed, Ready for action !", "main")
			});
		});
	});
});

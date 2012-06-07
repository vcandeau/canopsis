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
	nowjs: { port: 8085, debug: false, socketio_loglevel: 0, heartbeat: 60},
	mongodb: {}
};
var config = default_config;

//####################################################
//#  Logging
//####################################################

var log = {
	info:		function(message, author){
		this.print(this.date()+' INFO '+author+' '+message)
	},
	debug:		function(message, author){
		if (config.nowjs.debug)
			this.print(this.date()+' DEBUG '+author+' '+message)
	},
	warning:	function(message, author){
		this.print(this.date()+' WARN '+author+' '+message)
	},
	error:		function(message, author){
		this.print(this.date()+' ERR '+author+' '+message)
	},
	dump: 		function(message){
		if (config.nowjs.debug)
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
	var http = require('http');
	var nowjs = require("now");
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
				if (data[section])
					config[field] = default_config[field].extend(data[section])
				else
					config[field] = default_config[field]
					
				log.info("   + Ok", "config")
				callback()
			}
		});	
	}
	
	// MongoDB
	read_config_ini(process.env.HOME+'/etc/cstorage.conf', "mongodb", "master", function(){
		// AMQP
		read_config_ini(process.env.HOME+'/etc/amqp.conf', "amqp", "master", function(){
			// Now
			read_config_ini(process.env.HOME+'/etc/webserver.conf', "nowjs", "websocket", function(){
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
//#  Bind AMQP Queue on Now group
//####################################################

//GLOBAL
var amqp_queues = {};

var amqp_subscribe_queue = function(queue_name){
	var short_name = queue_name;
	var queueId = "amqp-" + queue_name;
	var queue_name = 'websocket_'+queueId
	
	log.info("Create Queue '"+queue_name+"'", "amqp")
	if (! amqp_queues[queue_name]){
		var queue = amqp_connection.queue(queue_name, {durable: false, exclusive: true}, function(){
			log.debug(" + Ok", "amqp")
				
			log.debug("Subscribe Queue '"+queue_name+"'", "amqp")
			this.subscribe( {ack:true}, function(message, headers, deliveryInfo){
				message['id'] = deliveryInfo.routingKey
				nowjs.getGroup(queueId).now.on_message(message)
				queue.shift()
			});
			
			log.debug("Bind '#' on '"+queue_name+"'", "amqp")
			this.bind("canopsis."+short_name, "#");
			this.on('queueBindOk', function() { log.debug(" + Ok", "amqp") });
			
			amqp_queues[queue_name] = this;	
		});
	}else{
		log.info(" + Already exist", "amqp")
	}
}

var amqp_unsubscribe_queue = function(queue_name){
	queue_name = 'websocket_'+queue_name
	var queue = amqp_queues[queue_name]
	if (queue){
		log.info("Close AMQP queue '" + queue_name + "'", "amqp")
		queue.destroy()
		delete amqp_queues[queue_name];
	}
}


//####################################################
//#  Start Now Server
//####################################################

var sessions = {
	sessions: {},
	clientIds: {}, 
	
	create: function(id, authId){
		if (this.check(id))
			return
		
		if (authId == undefined){
			log.error("You must specify authId !", "session")
			return
		}
			
		log.debug("Create session "+id+" ("+authId+")", "session")
		this.sessions[id] = authId
		
		if (this.clientIds[authId])
			this.clientIds[authId].push(id)
		else
			this.clientIds[authId] = [ id ]
	},
	
	drop: function(id){
		var authId = this.sessions[id]
		log.debug("Drop session "+id+" ("+authId+")", "session")
		delete this.sessions[id]
		this.clientIds[authId].splice(this.clientIds[authId].indexOf(id), 1)
	},
	
	check: function(id){
		return this.sessions[id]
	},
	
	getclientIds: function(authId){
		return this.clientIds[authId]
	}
}

var init_now = function(callback){
	var server = http.createServer(function(req, res){});
	server.listen(parseInt(config.nowjs.port));

	var everyone = nowjs.initialize(server, {socketio: {'log level': config.nowjs.socketio_loglevel}});
	
	////////////////// Utils
	var check_session = function(event){
		log.debug("Check session for "+event.now.authId+" ("+event.user.clientId+")", "nowjs");
		if (! sessions.check(event.user.clientId)){
			log.debug(" + You must auth !", "nowjs");
			return false
		}
		log.debug(" + Ok", "nowjs");
		return true
	}
	
	var check_authToken = function (clientId, authId, authToken, callback){
		if (mongodb_collection_object) {				
			mongodb_collection_object.findOne({'_id': authId}, function(err, record){
					
				if (err) {
					log.error(err, "mongodb");
				} else {
					if (record.authkey == authToken){
						log.info(" + Auth Ok", "nowjs")
						sessions.create(clientId, authId)
					} else {
						log.info(" + "+clientId + ": Invalid auth (authId: '"+authId+"')", "nowjs");
					}
					
					callback();
				}
			});
		}else{
			log.warning("MongoDB not ready.", "nowjs");
		}
	};
	
	////////////////// RPC
	everyone.now.auth = function(callback){
		var clientId = this.user.clientId
		check_authToken(clientId, this.now.authId, this.now.authToken, callback)
	}
	
	everyone.now.subscribe = function(type, queue_name, callback, scope){
		if (check_session(this)){
			var queueId = type+"-"+queue_name;
			
			log.info(this.now.authId + " subscribe to "+queueId, "nowjs");
			
			if (type == 'amqp')
				amqp_subscribe_queue(queue_name)
			
			var group = nowjs.getGroup(queueId)
			group.addUser(this.user.clientId);
			group.now.on_message = callback;
			//group.now.scope = scope;
		}
	}

	everyone.now.unsubscribe = function(type, queue_name){
		if (check_session(this)){
			var queueId = type+"-"+queue_name;
			
			log.info(this.now.authId + " unsubscribe from "+queueId, "nowjs");
				
			nowjs.getGroup(queueId).removeUser(this.user.clientId);
		}
	}
	
	everyone.now.publish = function(type, queue_name, message){
		if (check_session(this)){
			var queueId = type+"-"+queue_name;
			var group = nowjs.getGroup(queueId)
			if (group)
				group.now.on_message(message)
		}
	}
	
	everyone.now.direct = function(authId, message){
		if (check_session(this)){
			var from_authId = sessions.check(this.user.clientId)
			var to_clientIds = sessions.getclientIds(authId)
			
			log.info(this.now.authId + " send direct message to "+authId, "nowjs");
			log.debug(" + from_authId:   "+ from_authId , "nowjs");
			log.debug(" + from_clientId: "+ this.user.clientId , "nowjs");
			
			for (var i in to_clientIds){
				var to_clientId = to_clientIds[i]
				
				log.debug(" + to_clientId: "+ to_clientId , "nowjs");
			
				if (to_clientId)
					nowjs.getClient(to_clientId, function(){
						if (this.now && this.now['on_direct'])
							this.now.on_direct(message)
							log.debug("   + Sended" , "nowjs");
					});
			}
		}
	}
	
	////////////////// Binding events
	nowjs.on("connect", function(){
		var clientId = this.user.clientId
		log.info(this.now.authId + " connected ("+clientId+")", "nowjs");
	});

	nowjs.on("disconnect", function(){
		var clientId = this.user.clientId
		log.info(this.now.authId + " disconnected ("+clientId+")", "nowjs");
		sessions.drop(clientId)
	});
	
	callback()
}

// Close amqp queue if group is empty
var heartbeat = function(){
	nowjs.getGroups(function(groups){
		for (var i in groups){
			var group = groups[i]
			if (group != 'everyone'){
				nowjs.getGroup(group).count(function(count){
					log.debug("Group '"+group+"': "+count+" Client(s)", "heartbeat")
					if (count == 0){
						log.debug(" + Remove group", "heartbeat")
						amqp_unsubscribe_queue(group)
						nowjs.removeGroup(group)
					}
				})
			}
		}
	}) 
}

//####################################################
//#  Main Program
//####################################################

read_config(function(){
	log.debug("Configurations:", "main")
	config.nowjs.debug = (config.nowjs.debug === 'true')
	
	// Force debug
	config.nowjs.debug = true

	log.dump(config)
	
	init_mongo(function(){
		init_amqp(function(){
			init_now(function(){
				log.info("Initialization completed, Ready for action !", "main")
				setInterval(heartbeat, config.nowjs.heartbeat * 1000);
			});
		});
	});
});

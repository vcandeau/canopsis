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

var log = {
	info:		function(message, author){
		this.dump(this.date()+' INFO '+author+' '+message)
	},
	debug:		function(message, author){
		this.dump(this.date()+' DEBUG '+author+' '+message)
	},
	warning:	function(message, author){
		this.dump(this.date()+' WARN '+author+' '+message)
	},
	error:		function(message, author){
		this.dump(this.date()+' ERR '+author+' '+message)
	},
	dump: 		function(message){
		console.log(message)
	},
	date:		function(){
		var date = new Date()
		return date
	}
};

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

//////////// Config
var config = {
	amqp: {},
	faye: {},
	mongodb: {}
};
	
var read_config = function(callback){
	
	log.info("Read configuration's file ...", "config")
	
	var read_config_ini = function(file, field, section, callback){
		log.info(" + Read "+file+"...", "config")
		
		iniparser.parse(file, function(err, data){
			if (err) {
				log.error(err, "config");
				process.exit(1);
			} else {
				log.info("   + Ok", "config")
				config[field] = data[section]
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

//////////// MongoDB
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


//////////// AMQP
var init_amqp = function(callback){
	log.info("Connect to AMQP Broker ...", "amqp")
	var amqp_connection = amqp.createConnection({
		host: config.amqp.host,
		port: config.amqp.port,
		vhost: config.amqp.virtual_host
	});

	amqp_connection.addListener('ready', function(){
		log.info(" + Connected", "amqp")
		
		log.info("Create Queue", "amqp")
		var queue = this.queue('nodejs', {durable: false, exclusive: true}, function(){
			log.info(" + Ok", "amqp")
			
			/*log.info("Subscribe Queue", "amqp")
			this.subscribe( {ack:true}, function(message){
				//log.dump(util.inspect(message))
				if (faye_server)
					faye_server.getClient().publish('/amqp/events', message);
					
				queue.shift()
			});
			
			log.info("Bind Queue", "amqp")
			this.bind("canopsis.events", "#");
			this.on('queueBindOk', function() {
				log.info(" + Ok", "amqp")
			});*/
			
			callback()
		});	
	});
}

//////////// FAYE
var faye_sessions = {}
var faye_nb_client = 0

var init_faye = function(callback){
	
	var faye_check_authToken = function (clientId, authId, authToken, faye_callback, faye_message){

		if (mongodb_collection_object) {				
			mongodb_collection_object.findOne({'_id': authId}, function(err, record){
				
				log.debug("Try to auth "+authId+" ("+clientId+") ...", "faye");
				if (err) {
					log.error(err, "mongodb");
				} else {
					if (record.authkey == authToken){
						faye_sessions[clientId] = authId
						log.info(faye_sessions[clientId] + ": Open session ("+clientId+")", "faye");
					} else {
						log.info(clientId + ": Invalid auth (authId: '"+authId+"')", "faye");
						faye_message.error = 'Invalid auth';
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
			
			if (message.channel == '/meta/subscribe' && ! faye_sessions[clientId]) {
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
			
			// Check sessions
			if (! faye_sessions[clientId]){
				log.error(clientId + ": Invalid session, please auth ...", "faye")
				message.error = 'Invalid session, please auth ...';
			}
			
			callback(message);
		}
	};


	log.info("Start Faye servers", "faye")
	faye_server = new faye.NodeAdapter({mount: '/'});

	faye_server.bind('handshake', function(clientId) {
		faye_nb_client +=1
		log.info(clientId+': Connected, '+faye_nb_client+' Client(s) Online.', "faye")
	})
	faye_server.bind('disconnect', function(clientId) {
		faye_nb_client -=1
		log.info(faye_sessions[clientId]+': Disconnected, '+faye_nb_client+' Client(s) Online.', "faye")
		// Clean sessions
		try {
			log.info(faye_sessions[clientId] + ": Close session ("+clientId+")", "faye");
			delete(faye_sessions[clientId])
		} catch (err) {
			log.error("Invalid session for " + clientId, "faye");
		}
	})

	faye_server.bind('subscribe', function(clientId, channel) {
		log.info(faye_sessions[clientId]+': Suscribe to '+channel, "faye")
	})
	faye_server.bind('unsubscribe', function(clientId, channel) {
		log.info(faye_sessions[clientId]+': Unsuscribe to '+channel, "faye")
	})

	faye_server.addExtension(faye_auth);

	log.info(" + Listen on "+config.faye.port, "faye")
	faye_server.listen(parseInt(config.faye.port));
	
	callback()
}

///////////////////// MAIN

read_config(function(){
	init_mongo(function(){
		init_amqp(function(){
			init_faye(function(){
				log.info("Initialization completed", "main")
			});
		});
	});
});

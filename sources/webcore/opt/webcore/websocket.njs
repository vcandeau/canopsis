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
	info:		function(message){
		this.dump('INFO: '+message)
	},
	debug:		function(message){
		this.dump('DEBUG: '+message)
	},
	warning:	function(message){
		this.dump('WARN: '+message)
	},
	error:		function(message){
		this.dump('ERR: '+message)
	},
	dump: 		function(message){
		console.log(message)
	}
};

log.info("Load modules ...")
try {
	var mongodb = require('mongodb');
	var faye   = require('faye');
	var amqp   = require('amqp');
	var util   = require('util');
	
} catch (err) {
	log.error("Impossible to load modules")
	log.dump(err)
	process.exit(1);
}
log.info(" + Ok")


log.info("Load configurations ...")
var config = {
	amqp: {
		host: '127.0.0.1',
		vhost: 'canopsis',
		port: 5672
	},
	faye: {
		port: 8085
	},
	mongodb: {
		host: '127.0.0.1',
		port: 27017,
		db: 'canopsis'
	}
};
log.info(" + Ok")

//////////// AMQP
/*log.info("Connect to AMQP Broker ...")
var amqp_connection = amqp.createConnection({
	host: config.amqp.host,
	port: config.amqp.port,
	vhost: config.amqp.vhost
});

amqp_connection.addListener('ready', function(){
	log.info(" + Connected")
	
	log.info("Create Queue")
	var queue = this.queue('nodejs', {durable: false, exclusive: true}, function(){
		log.info(" + Ok")
		
		log.info("Subscribe Queue")
		this.subscribe( {ack:true}, function(message){
			//log.dump(util.inspect(message))
			if (faye_server)
				faye_server.getClient().publish('/amqp/events', message);
				
			queue.shift()
		});
		
		log.info("Bind Queue")
		this.bind("canopsis.events", "#");
		this.on('queueBindOk', function() {
			log.info(" + Ok")
		});
	});	
});
*/

//////////// MongoDB
log.info("Connect to MongoDB ...")
var mongodb_server = new mongodb.Server(config.mongodb.host, config.mongodb.port, {})
var mongodb_client = new mongodb.Db(config.mongodb.db, mongodb_server);
var mongodb_collection_object = undefined

mongodb_client.open(function(err, p_client) {
	if (err) {
		log.error(err);
	} else {
		log.info(" + Ok")
		mongodb_collection_object = new mongodb.Collection(mongodb_client, 'object');
	}
});


/*
var client = new Db('canopsis', new Server('127.0.0.1', 27017, {}));

var listAllData = function(err, collection) {
    collection.find().toArray(function(err, results) {
        console.log(results);
    });
}

client.open(function(err, pClient) {
	client.collection('object', listAllData);
});*/

//////////// FAYE
var faye_sessions = {}
var faye_nb_client = 0

var faye_check_authToken = function (clientId, authId, authToken, faye_callback, faye_message){

	if (mongodb_collection_object) {				
		mongodb_collection_object.findOne({'_id': authId}, function(err, record){
			
			log.info("Faye: Try to auth "+authId+" ("+clientId+") ...");
			if (err) {
				log.error(err);
			} else {
				if (record.authkey == authToken){
					faye_sessions[clientId] = authId
					log.info("Faye: "+faye_sessions[clientId] + ": Open session ("+clientId+")");
				} else {
					log.info("Faye: "+clientId + ": Invalid auth (authId: '"+authId+"')");
					faye_message.error = 'Invalid auth';
				}
				faye_callback(faye_message);
			}
		});
	}else{
		log.warning("Faye: MongoDB not ready.");
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
				log.error("Faye: "+clientId + ": Impossible to subscribe, please set auth informations...");
				log.dump(err);
			}
		};
		
		// Check sessions
		if (! faye_sessions[clientId]){
			log.error("Faye: "+clientId + ": Invalid session, please auth ...")
			message.error = 'Invalid session, please auth ...';
		}
		
		callback(message);
	}
};


log.info("Start Faye servers")
faye_server = new faye.NodeAdapter({mount: '/'});

faye_server.bind('handshake', function(clientId) {
	faye_nb_client +=1
	log.info('Faye: '+clientId+': Connected, '+faye_nb_client+' Client(s) Online.')
})
faye_server.bind('disconnect', function(clientId) {
	faye_nb_client -=1
	log.info('Faye: '+faye_sessions[clientId]+': Disconnected, '+faye_nb_client+' Client(s) Online.')
	// Clean sessions
	try {
		log.info("Faye: "+faye_sessions[clientId] + ": Close session ("+clientId+")");
		delete(faye_sessions[clientId])
	} catch (err) {
		log.error("Invalid session for " + clientId);
	}
})

faye_server.bind('subscribe', function(clientId, channel) {
	log.info('Faye: '+faye_sessions[clientId]+': Suscribe to '+channel)
})
faye_server.bind('unsubscribe', function(clientId, channel) {
	log.info('Faye: '+faye_sessions[clientId]+': Unsuscribe to '+channel)
})

faye_server.addExtension(faye_auth);

log.info(" + Listen on "+config.faye.port)
faye_server.listen(config.faye.port);

#!/usr/bin/env python
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

from kombu import BrokerConnection, Exchange, Queue
from kombu.pools import producers
from amqplib.client_0_8.exceptions import AMQPConnectionException
import socket

import time, logging, threading, os


class camqp(threading.Thread):
	def __init__(self, host="localhost", port=5672, userid="guest", password="guest", virtual_host="canopsis", exchange_name="canopsis", logging_level=logging.ERROR, read_config_file=True, auto_connect=True):
		threading.Thread.__init__(self)
		
		self.logger = logging.getLogger("camqp")
		
		self.host=host
		self.port=port
		self.userid=userid
		self.password=password
		self.virtual_host=virtual_host
		self.exchange_name=exchange_name
		self.logging_level = logging_level
		
		self.read_config("amqp")
		
		self.amqp_uri = "amqp://%s:%s@%s:%s/%s" % (self.userid, self.password, self.host, self.port, self.virtual_host)
		
		#self.logger.setLevel(logging_level)
		
		self.exchange_name_events=exchange_name+".events"
		self.exchange_name_alerts=exchange_name+".alerts"
		self.exchange_name_incidents=exchange_name+".incidents"
		
		self.chan = None
		self.conn = None
		self.connected = False
		
		self.RUN = True
	
		self.exchanges = {}	
		
		self.queues = {}
		
		self.connection_errors = (	 AMQPConnectionException,
									 socket.error,
									 IOError,
									 OSError,)
									 #AttributeError)
									 						 
		## create exchange
		self.logger.debug("Create exchanges object")
		for exchange_name in [self.exchange_name, self.exchange_name_events, self.exchange_name_alerts, self.exchange_name_incidents]:
			self.logger.debug(" + %s" % exchange_name)
			self.exchanges[exchange_name] =  Exchange(exchange_name , "topic", durable=True, auto_delete=False)
		
		if auto_connect:
			self.connect()
		
		self.logger.debug("Object canamqp initialized")

	def run(self):
		self.logger.debug("Start thread ...")
		reconnect = False
		
		while self.RUN:
			
			self.connect()
			
			#self.wait_connection()
			
			if self.connected:
				self.init_queue(reconnect=reconnect)
				
				while self.RUN:
					try:
						self.conn.drain_events(timeout=0.5)
					except socket.timeout:
						pass
					except self.connection_errors, err:
						self.logger.error("Connection error ! (%s)" % err)
						break
					except Exception, err:
						self.logger.error(err)
					
				self.disconnect()
		
			if self.RUN:
				self.logger.error("Connection loss, try to reconnect in few seconds ...")
				reconnect = True
				self.wait_connection(timeout=5)
			
		self.logger.debug("End of thread ...")
		
	def stop(self):
		self.logger.debug("Stop thread ...")
		self.RUN = False	

	def connect(self):
		if not self.connected:
			self.logger.debug("Connect to AMQP Broker (%s:%s)" % (self.host, self.port))
			
			self.conn = BrokerConnection(self.amqp_uri)
				
			self.logger.debug(" + Open channel")
			try:
				self.chan = self.conn.channel()
				self.logger.info("Connected to AMQP Broker.")
				
				self.connected = True
				self.logger.debug("Channel openned. Ready to send messages")
				
			except Exception, err:
				self.logger.error(err)
		else:
			self.logger.debug("Allready connected")
					
	def init_queue(self, reconnect=False):
		if self.queues:
			self.logger.debug("Init queues")
			for queue_name in self.queues.keys():
				self.logger.debug(" + %s" % queue_name)
				qsettings = self.queues[queue_name]
				
				if not qsettings['queue']:
					self.logger.debug("   + Create queue")
					qsettings['queue'] = Queue(queue_name,
											exchange = self.exchanges[qsettings['exchange_name']],
											routing_key = qsettings['routing_keys'][0],
											exclusive = qsettings['exclusive'],
											auto_delete = qsettings['auto_delete'],
											no_ack = qsettings['no_ack'])
					
				if not qsettings['consumer']:
					self.logger.debug("   + Create Consumer")
					qsettings['consumer'] = self.conn.Consumer(qsettings['queue'], callbacks=[ qsettings['callback'] ])
				
				self.logger.debug("   + Consume queue")
				qsettings['consumer'].consume()

	
	def add_queue(self, queue_name, routing_keys, callback, exchange_name=None, no_ack = True, exclusive=False, auto_delete=True):
		if not isinstance(routing_keys, list):
			routing_keys = [ routing_keys ]
		
		if not exchange_name:
			exchange_name = self.exchange_name		
		
		self.queues[queue_name]={	'queue': False,
									'consumer': False,
									'queue_name': queue_name,
									'routing_keys': routing_keys,
									'callback': callback,
									'exchange_name': exchange_name,
									'no_ack': no_ack,
									'exclusive': exclusive,
									'auto_delete': auto_delete
							}

	def publish(self, msg, routing_key, exchange_name=None):
		self.wait_connection()
		if self.connected:
			if not exchange_name:
				exchange_name = self.exchange_name
			
			self.logger.debug("Send message to %s in %s" % (routing_key, exchange_name))
			with producers[self.conn].acquire(block=True) as producer:
				producer.publish(msg, serializer="json", compression=None, routing_key=routing_key, exchange=self.exchanges[exchange_name])
				
		else:
			self.logger.error("You are not connected ...")
			
		
	def disconnect(self):
 		if self.connected:
			self.logger.info("Disconnect from AMQP Broker")
	
			for queue_name in self.queues.keys():
				if self.queues[queue_name]['consumer']:
					self.logger.debug(" + Cancel consumer on %s" % queue_name)
					try:
						self.queues[queue_name]['consumer'].cancel()
					except:
						pass
						
					del(self.queues[queue_name]['consumer'])
					self.queues[queue_name]['consumer'] = False
					del(self.queues[queue_name]['queue'])
					self.queues[queue_name]['queue'] = False
				
			self.conn.release()
			#self.conn.close()
			self.connected = False

	def wait_connection(self, timeout=5):
		i=0
		while self.RUN and not self.connected and i < (timeout*2):
			try:
				time.sleep(0.5)
			except:
				pass
			i+=1

	def read_config(self, name):

		filename = '~/etc/' + name + '.conf'
		filename = os.path.expanduser(filename)

		import ConfigParser
		self.config = ConfigParser.RawConfigParser()

		try:
			self.config.read(filename)

			section = 'master'

			self.host = self.config.get(section, "host")
			self.port = self.config.getint(section, "port")
			self.userid = self.config.get(section, "userid")
			self.password = self.config.get(section, "password")
			self.virtual_host = self.config.get(section, "virtual_host")
			self.exchange_name = self.config.get(section, "exchange_name")

		except Exception, err:
			self.logger.error("Impossible to load configurations (%s), use default ..." % err)
			
	def __del__(self):
		self.stop()

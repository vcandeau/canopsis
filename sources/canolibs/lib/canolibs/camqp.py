#!/usr/bin/env python
from twisted.internet import reactor, task
from twisted.internet.defer import inlineCallbacks, returnValue
from twisted.internet.protocol import ClientCreator
from txamqp.client import TwistedDelegate
from txamqp.content import Content
from txamqp.protocol import AMQClient
import txamqp.spec

import time, signal, logging, threading, os, sys
import ConfigParser

files_preserve = [reactor.waker.o, reactor.waker.i]

class camqp(threading.Thread):
	def __init__(self, host="localhost", port=5672, userid="guest", password="guest", virtual_host="/", exchange_name="canopsis", logging_level=logging.DEBUG, read_config_file=True):
		threading.Thread.__init__(self)
		
		logging.basicConfig(level=logging_level,
			format='%(asctime)s %(name)s %(levelname)s %(message)s',
		)

		self.logger = logging.getLogger("canamqp")

		self.chan = None
		self.conn = None
		
		self.host=host
		self.port=port
		self.userid=userid
		self.password=password
		self.virtual_host=virtual_host
		self.exchange_name=exchange_name
		
		self.connected = False
		
		self.RUN = 1
		
		pyamqpconf = os.path.expanduser("~/etc/pyamqp.conf")
		if os.path.exists(pyamqpconf):
			if read_config_file:
				self.read_config(pyamqpconf)
		
		self.logger.setLevel(logging_level)
		
		self.queues = {};
		
		self.task_heartbeat = task.LoopingCall(self.heartbeat)
		self.heartbeat_interval = 30
		
		self.delegate = TwistedDelegate()
		
		try:
			self.spec = txamqp.spec.load(os.path.expanduser("~/lib/canolibs/amqp0-8.xml"))
		except:
			self.spec = txamqp.spec.load("amqp0-8.xml")
			
		self.set_client()
		
		self.logger.debug("Object canamqp initialized")
		
	def on_error(self, err):
		self.logger.error("txAMQP dump:\n%s" % err)
		
	def on_error_mute(self, err):
		pass

	def on_connection_error(self, err):
		self.logger.error("Connection ERROR, txAMQP dump:\n%s" % err)
		#self.logger.error("Disconnect ...")
		#self.disconnect()
		self.connected = False
		reactor.callFromThread(self.reconnect)

	def on_publish_error(self, err):
		self.logger.error("Publish ERROR, txAMQP dump:\n%s" % err)
		self.disconnect()
		reactor.callFromThread(self.reconnect)
		
	@inlineCallbacks
	def reconnect(self):
		if self.RUN:
			self.logger.debug("Try to re-connect after 5 seconds ...")
			for i in range(10):
				if not self.RUN:
					break
				time.sleep(0.5)
				
			if self.RUN:	
				self.set_client()
				yield self.client
		else:
			yield None
		
	def heartbeat(self):
		self.logger.debug("Heartbeat ...")
		if self.connected:
			msg = Content("{'heartbeat': 1}")
			self.publish(msg, "heartbeat", "amq.topic")

	def set_client(self):
		self.logger.debug("Set AMQP client ...")
		self.client = ClientCreator(reactor, AMQClient, delegate=self.delegate, vhost=self.virtual_host, spec=self.spec).connectTCP(self.host, self.port)
		self.client.addCallback(self.on_connect)
		self.client.addErrback(self.on_connection_error)

	@inlineCallbacks
	def run(self):
		self.logger.debug("Start thread ...")
		
		if reactor.running:
			yield self.client
			while self.RUN:
				time.sleep(1)
		else:
			self.logger.debug("Start Reactor ...")
			reactor.run(installSignalHandlers=0)
		
	def stop(self):
		self.logger.debug("Stop thread ...")
		self.RUN = 0
		reactor.callFromThread(self.disconnect)

	@inlineCallbacks
	def on_connect(self, conn):
		self.conn = conn
		self.logger.debug("Connected to broker.")

		yield self.conn.authenticate(self.userid, self.password)
		self.logger.debug("Authenticated.")
		
		self.chan = yield conn.channel(1)
		yield self.chan.channel_open()
		self.logger.debug("Channel 1 openned")
		
		self.chan_pub = yield conn.channel(2)
		yield self.chan_pub.channel_open()
		self.logger.debug("Channel 2 openned")
		
		yield self.chan.exchange_declare(exchange=self.exchange_name, type='topic', durable=True, auto_delete=False)
		self.logger.debug("Topic Exchange %s declared ..." % self.exchange_name)

		self.connected = True
		self.logger.debug("Channel openned. Ready to send messages")
		
		self.logger.debug("Create Queues, binding and consumer")
		for key in self.queues.keys():
			qsettings = self.queues[key]
			queue_name = qsettings['queue_name']
			exchange_name = qsettings['exchange_name']
			no_ack = qsettings['no_ack']
			routing_keys = qsettings['routing_keys']
			exclusive = qsettings['exclusive']
			auto_delete = qsettings['auto_delete']
			
			self.logger.debug("+ Create Queue '%s'" % queue_name)
			yield self.chan.queue_declare(queue=queue_name, exclusive=exclusive, auto_delete=auto_delete)
			
			self.logger.debug("  - Declare consumer ...")
			reply = yield self.chan.basic_consume(queue=queue_name, no_ack=no_ack)
			consumer_tag = reply.consumer_tag
			self.queues[key]['consumer_tag'] = consumer_tag
			
			for routing_key in routing_keys:
				self.logger.debug("  - Bind on '%s'" % routing_key)
				yield self.chan.queue_bind(exchange=exchange_name, queue=queue_name, routing_key=routing_key)
			
			self.logger.debug("  - Declare callback with consumer_tag: %s ..." % consumer_tag)
			queue = yield self.conn.queue(consumer_tag)
			self.queues[key]['queue'] = queue
			d = queue.get()
			d.addCallback(self.on_message, queue, qsettings)
			d.addErrback(self.on_error_mute)
		
		self.task_heartbeat.start(self.heartbeat_interval)
		returnValue((self.conn, self.chan))
	
	def add_queue(self, queue_name, routing_keys, callback, exchange_name=None, no_ack = True, exclusive=False, auto_delete=True):
		routing_keys = list(routing_keys)
		
		if not exchange_name:
			exchange_name = self.exchange_name
		
		self.queues[queue_name]={	'queue_name': queue_name,
									'routing_keys': routing_keys,
									'callback': callback,
									'exchange_name': exchange_name,
									'no_ack': no_ack,
									'exclusive': exclusive,
									'auto_delete': auto_delete
							}
	
	@inlineCallbacks
	def on_message(self, msg, queue, qsettings):
		if self.connected:
			
			#self.logger.debug(" + [%d - %s] Received %r" % (self.i, msg.delivery_tag, msg.content.body))
			try:
				qsettings['callback'](msg)
			except Exception, err:
				self.logger.error("Error in callback function: %s" % err)
			
			if not qsettings['no_ack']:
				self.chan.basic_ack(delivery_tag=msg.delivery_tag)
			
			## Purge queue
			i = 1
			start = time.time()
			while True:
				try:
					msg = yield queue.get(timeout=0.5)
					i += 1
					
					#print " + + [%d - %s] Received %r" % (self.i, msg.delivery_tag, msg.content.body)
					try:
						qsettings['callback'](msg)
					except Exception, err:
						self.logger.error("Error in callback function: %s" % err)
					
					if not qsettings['no_ack']:
						self.chan.basic_ack(delivery_tag=msg.delivery_tag)
				except:
					end = time.time()
					if i > 10:
						elapsed = end - start
						self.logger.debug("Proceeded burst of %i messages in %0.3f seconds (%0.1f m/s)" %(i, elapsed, (i/elapsed)))
					break
			
			d = queue.get()
			d.addCallback(self.on_message, queue, qsettings)
			d.addErrback(self.on_error_mute)

	def publish(self, msg, routing_key, exchange_name=None):
		self.wait_connection()
		if self.connected:
			if not exchange_name:
				exchange_name = self.exchange_name
				
			@inlineCallbacks
			def send_message(msg, exchange_name, routing_key):
				#self.logger.debug("Send message to %s in %s" % (routing_key, exchange_name))
				d = self.chan_pub.basic_publish(exchange=exchange_name, content=msg, routing_key=routing_key)
				d.addErrback(self.on_publish_error)
				yield d
				
			reactor.callFromThread(send_message, msg, exchange_name, routing_key)
		
	@inlineCallbacks
	def disconnect(self):
 		if self.connected:
			self.task_heartbeat.stop()
			
			for key in self.queues.keys():
				qsettings = self.queues[key]
				self.logger.debug("Close Queue '%s' ..." % qsettings['queue_name'])
				qsettings['queue'].close()
			
			self.logger.debug("Close channel 2 ...")
			d = self.chan_pub.channel_close()
			d.addErrback(self.on_error_mute)
			yield d
			
			self.logger.debug("Close channel 1 ...")
			d = self.chan.channel_close()
			d.addErrback(self.on_error_mute)
			yield d
			
			self.logger.debug("Close Connection ...")
			chan0 = yield self.conn.channel(0)
			d = chan0.connection_close()
			d.addErrback(self.on_error_mute)
			yield d
			self.logger.debug("Disconnected.")
		
		self.connected = False
		if reactor.running and not self.RUN:
			self.logger.debug("Stop Reactor ...")
			reactor.stop()

	def wait_connection(self):
		while self.RUN and not self.connected:
			time.sleep(0.5)

	def read_config(self, filename):
		# Read config file
		config = ConfigParser.RawConfigParser()
		#config.read(os.path.expanduser('~/etc/pyamqp.conf'))
		config.read(filename)

		self.host = config.get("master", "host")
		self.port = config.getint("master", "port")
		self.userid = config.get("master", "userid")
		self.password = config.get("master", "password")
		self.virtual_host = config.get("master", "virtual_host")
		self.exchange_name = config.get("master", "exchange_name")
		self.logging_level = config.get("master", "logging_level")

		if self.logging_level == "DEBUG":
			self.logging_level = logging.DEBUG
		elif self.logging_level == "INFO":
			self.logging_level = logging.INFO
		elif self.logging_level == "WARNING":
			self.logging_level = logging.WARNING
		elif self.logging_level == "ERROR":
			self.logging_level = logging.ERROR
		elif self.logging_level == "CRITICAL":
			self.logging_level = logging.CRITICAL

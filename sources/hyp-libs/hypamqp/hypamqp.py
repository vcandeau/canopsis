#! /usr/bin/env python

import threading, time, sys, signal, random, os
from kombu import BrokerConnection
from kombu import Producer, Consumer, Exchange, Queue
import logging

class hypamqp(object):

	def __init__(self, exchange_name="amqp.topic", logging_level=logging.DEBUG, hostname="127.0.0.1", port=5672, userid="guest", password="guest", virtual_host="/", insist=True):

		self.hostname=hostname
		self.port=port
                self.userid=userid
                self.password=password
                self.virtual_host=virtual_host
		self.insist=insist
		self.exchange_name=exchange_name

		self.logger = logging.getLogger('hypamqp')
		self.logger.setLevel(logging_level)

		### Exchanges
		self.topic_exchange = None
		self.direct_exchange = None

		### Queues
		self.queues = {}
		self.topic_queue = None

		### Status vars
		self.connected = False
		self.RUN = True


	def connect(self):
		self.logger.debug("Connect ...")
		self.conn = BrokerConnection(
			hostname=self.hostname,
			port=self.port,
		        userid=self.userid,
		        password=self.password,
		        virtual_host=self.virtual_host,
			insist=self.insist
			)

		self.RUN = True
		while (not self.connected) and self.RUN:
			try:
				self.conn.ensure_connection(errback=self.onConnError, max_retries=1)
				self.connected = True
				self.RUN = True
				self.logger.debug("Connected")

			except:
				self.logger.error("Impossible to connect ....")
				self.connected = False


	def consumeQueue(self, queue_name, on_message):
		if not self.connected:
			self.logger.warning("consumeQueue, Not connected ...")
			return None
		
		queue = self.queues[queue_name]['queue']

		self.logger.debug("Wait messages on '%s' ..." % queue_name)
		while self.connected and self.RUN:
			rawmsg = None
			
			try:
				#self.logger.debug("Queue Get ... ")
				rawmsg = queue.get(no_ack=True)
			except:
				self.logger.error("Error in connection, impossible to receive messages ...")
				self.reconnect()
				queue = self.queues[queue_name]['queue']
				if self.connected:
					self.logger.debug("Ok, wait new messages on '%s' ..." % queue_name)
				else:
					self.logger.debug("Re-connection fail !")
					return

			if rawmsg:
				self.logger.debug("Message received")
				on_message(rawmsg)
			else:
				time.sleep(0.2)		

	def createTopicExchange(self):
		if not self.connected:
			self.logger.warning("createTopicExchange, Not connected ...")
			return None
			
		self.topic_channel = self.conn.channel()
		self.topic_exchange = Exchange(name=self.exchange_name, type="topic")
		self.topic_exchange = self.topic_exchange(self.topic_channel)
		self.topic_exchange.declare()
		self.logger.debug("Topic Exchange created")

	def publishTopic(self, body, routing_key="#"):
		if not self.connected:
			self.logger.warning("publishTopic, Not connected ...")
			return None

		if self.topic_exchange == None:
			self.createTopicExchange()

		message=self.topic_exchange.Message(body)
		publish = self.conn.ensure(self.topic_exchange, self.topic_exchange.publish, errback=self.onActionError, max_retries=3)
		publish(message, routing_key=routing_key)

		self.logger.debug("Message sended to routing-key %s" % routing_key)

	def createTopicQueue(self, queue_name, routing_key):
		if not self.connected:
			self.logger.warning("createTopicQueue, Not connected ...")
			return None

		if self.topic_exchange == None:
			self.createTopicExchange()

		queue = Queue(name=queue_name, exchange=self.topic_exchange, routing_key=routing_key)
		queue = queue(self.topic_channel)
		queue.declare()

		self.queues[queue_name] = { 'type': 'topic', 'queue': queue ,'routing_key': routing_key }
		self.logger.debug("Queue '%s' created" % queue_name)
		return queue

	def onConnError(self, exc, interval):
		self.logger.error("Couldn't connect: %r. Retry in %ds" % (exc, interval))
		self.connected = False

	def onActionError(self, exc, interval):
		self.logger.error("Couldn't process action: %r. Retry in %ds" % (exc, interval))

	def reconnect(self):
		self.logger.debug("Try to re-connect !")

		self.disconnect()
		self.connect()

		if self.connected:
			self.logger.debug("Re-create Queues ...")
			for queue_name in self.queues.keys():
				self.createTopicQueue(queue_name, self.queues[queue_name]['routing_key'])

			self.logger.debug("Re-connected !")
		else:
			self.logger.debug("Not Re-connected !")


	def disconnect(self):
		self.connected = False

		self.RUN = False
		#time.sleep(1)
		for queue_name in self.queues.keys():
			self.logger.debug("Delete queue '%s'" % queue_name)
			self.queues[queue_name]['queue'].delete()

		if self.connected:
			self.conn.release()

		self.topic_exchange = None
		self.logger.debug("Disconnected")

	def __del__(self):
		if self.connected:
			self.disconnect()

			

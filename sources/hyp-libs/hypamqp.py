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


	def connect(self):
		self.conn = BrokerConnection(
			hostname=self.hostname,
			port=self.port,
		        userid=self.userid,
		        password=self.password,
		        virtual_host=self.virtual_host,
			insist=self.insist
			)

		try:
			self.conn.ensure_connection(errback=self.onConnError, max_retries=2)
		except:
			self.logger.error("Impossible to connect ....")
			self.connected = False
			
		#self.conn.connect()
	
		self.connected = True

		self.logger.debug("Connected")


	def createTopicExchange(self):
		self.topic_channel = self.conn.channel()
		self.topic_exchange = Exchange(name=self.exchange_name, type="topic")
		self.topic_exchange = self.topic_exchange(self.topic_channel)
		self.topic_exchange.declare()
		self.logger.debug("Topic Exchange created")

	def publishTopic(self, body, routing_key="#"):
		if self.topic_exchange == None:
			self.createTopicExchange()

		message=self.topic_exchange.Message(body)
		publish = self.conn.ensure(self.topic_exchange, self.topic_exchange.publish, errback=self.onActionError, max_retries=3)
		publish(message, routing_key=routing_key)
		self.logger.debug("Message sended to routing-key %s" % routing_key)

	def createTopicQueue(self, queue_name, routing_key):
		if self.topic_exchange == None:
			self.createTopicExchange()

		self.topic_queue = Queue(name=queue_name, exchange=self.topic_exchange, routing_key=routing_key)
		self.topic_queue = self.topic_queue(self.topic_channel)
		self.topic_queue.declare()
		return 	self.topic_queue	

	def onConnError(self, exc, interval):
		self.logger.error("Couldn't connect: %r. Retry in %ds" % (exc, interval))
		self.connected = False

	def onActionError(self, exc, interval):
		self.logger.error("Couldn't process action: %r. Retry in %ds" % (exc, interval))

	def __del__(self):
		if self.topic_queue != None:
			self.topic_queue.delete()

		if self.connected:
			self.conn.release()

		self.logger.debug("Disconnected")
			

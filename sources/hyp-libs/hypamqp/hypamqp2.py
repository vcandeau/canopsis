#!/usr/bin/env python

import time, signal, logging, threading
#from neb2socket import *
from amqplib import client_0_8 as amqp

class hypamqp(object):
	def __init__(self, host="localhost:5672 ", userid="guest", password="guest", virtual_host="/", exchange_name="hypervision", logging_level=logging.DEBUG):
	

		logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

		self.logger = logging.getLogger("neb2socket")
		self.logger.setLevel(logging_level)
		
		self.chan = None
		self.conn = None
		
		self.host=host
		self.userid=userid
		self.password=password
		self.virtual_host=virtual_host
		self.exchange_name=exchange_name
		
		self.queues = {};
		self.pub_chan = None
		
		self.connected = False

	def connect(self):
		self.conn = amqp.Connection(host="localhost:5672 ", userid="guest", password="guest", virtual_host="/", insist=False)
		self.pub_chan = self.conn.channel()
		self.pub_chan.exchange_declare(exchange=self.exchange_name, type="topic", durable=True, auto_delete=False)
		self.connected = True
		
		
	def create_queue(self, queue_name):
		self.logger.debug("Create Queue '%s'" % queue_name)
		#chan = self.conn.channel()
		chan = self.pub_chan
		chan.exchange_declare(exchange=self.exchange_name, type="topic", durable=True, auto_delete=False)
		chan.queue_declare(queue=queue_name, durable=False, exclusive=False, auto_delete=True)
		self.queues[queue_name]={'chan': chan, 'name': queue_name, 'thread': None, 'tag': None}

	def bind_queue(self, queue_name, routing_key):
		self.logger.debug("Bind Queue '%s' on '%s'" % (queue_name, routing_key))
		chan = self.queues[queue_name]['chan']
		chan.queue_bind(queue=queue_name, exchange=self.exchange_name, routing_key=routing_key)
		
	def handle_response(self, msg):
		print "Response:", msg.body	
		
	def consume_queue(self, queue_name, callback):
		self.logger.debug("Consume Queue '%s'" % queue_name)
		chan = self.queues[queue_name]['chan']
		self.queues[queue_name]['callback'] = callback
		#self.queues[queue_name]['tag'] = chan.basic_consume(queue=queue_name, callback=callback, consumer_tag=queue_name+"-tag", no_ack=True)#, no_ack=True )
		
		thr_waiter = self.thread_waiter(self.logger, self.queues[queue_name])
		thr_waiter.start()
		self.queues[queue_name]['thread'] = thr_waiter
		
	def queue_wait(self, queue_name):
		self.queues[queue_name]['chan'].wait()
	
	def publish(self, msg, routing_key):
		if not self.pub_chan:
			self.pub_chan = self.conn.channel()
			self.pub_chan.exchange_declare(exchange=self.exchange_name, type="topic", durable=True, auto_delete=False)
			
		self.pub_chan.basic_publish(msg,exchange=self.exchange_name,routing_key=routing_key)
		
	def disconnect(self):
		if self.connected:
			self.connected = False
			self.logger.debug("Disconnect")
			
			for queue_name in self.queues.keys():
				self.logger.debug("Close Queue '%s'" % queue_name)
				chan = self.queues[queue_name]['chan']
				
				if self.queues[queue_name]['thread']:
					self.logger.debug("\tStop Queue thread")
					self.queues[queue_name]['thread'].stop()
					self.queues[queue_name]['thread']._Thread__stop()
					
				#msg = amqp.Message("BYE")
				#self.publish(msg, queue_name)

				if self.queues[queue_name]['thread']:
					self.logger.debug("\tJoin Thread")
					self.queues[queue_name]['thread'].join()

				if self.queues[queue_name]['tag']:
					tag = self.queues[queue_name]['tag']
					self.logger.debug("\tCancel Consumer, tag: %s" % tag)
					chan.basic_cancel(tag)
				
				self.logger.debug("\tDelete Queue")
				chan.queue_delete(queue_name , if_unused=True)
				
				self.logger.debug("\tClose Queue's Chan")
				chan.close()
				
			if self.pub_chan:
				self.logger.debug("Close publish channel" )
				self.pub_chan.close()

			if self.conn:
				self.logger.debug("Close connection")
				self.conn.close()
	
	def __del__(self):
		self.logger.debug("Delete Object")
		self.disconnect()
		
	class thread_waiter(threading.Thread):
		def __init__(self,logger, queue):
			threading.Thread.__init__(self)
			self._stop = threading.Event()

			self.queue = queue
			self.logger = logger
			
		def run(self):
			
			queue_name = self.queue["name"]
			chan = self.queue["chan"]
			callback = self.queue["callback"]
			self.RUN=1
			
			self.logger.debug("Run waiter thread on queue %s" % queue_name)
			time.sleep(1)
			while self.RUN:
				#chan.wait()
				#self.logger.debug("%s: Get message" % queue_name)
				msg = chan.basic_get(queue_name, no_ack=True)
				if not msg:
					time.sleep(0.1)
				else:
					callback(msg)
			
		def stop(self):
			#self.logger.debug("Stop thread")
			self.RUN=0
			#self._stop.set()
			
			




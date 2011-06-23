#!/usr/bin/env python

import time, signal, logging, threading, os
import ConfigParser
from amqplib import client_0_8 as amqp

RUN = 1

def retry(ExceptionToCheck, tries=4, delay=5, backoff=1):
	"""Retry decorator
	original from http://wiki.python.org/moin/PythonDecoratorLibrary#Retry
	"""
	def deco_retry(f):
		def f_retry(*args, **kwargs):
			mtries, mdelay = tries, delay
			inf = 0
			if mtries == 0:
				inf =1
	
			while (mtries > 0 or inf) and RUN:
		
				try:
					return f(*args, **kwargs)
				except ExceptionToCheck, e:
					print "%s, Retrying in %d seconds..." % (str(e), mdelay)
					time.sleep(mdelay)
					if not inf:
						mtries -= 1
					mdelay *= backoff
					lastException = e
					
			raise lastException
		return f_retry # true decorator
	return deco_retry


class hypamqp(object):
	def __init__(self, host="localhost", port=5672, userid="guest", password="guest", virtual_host="/", exchange_name="canopsis", logging_level=logging.DEBUG, read_config_file=True):
	

		logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

		self.logger = logging.getLogger("neb2socket")
		
		self.chan = None
		self.conn = None
		
		self.host=host
		self.port=port
		self.userid=userid
		self.password=password
		self.virtual_host=virtual_host
		self.exchange_name=exchange_name
		
		if read_config_file:
			self.read_config(os.path.expanduser('~/etc/pyamqp.conf'))
		
		self.logger.setLevel(logging_level)
		
		self.queues = {};
		self.pub_chan = None
		
		self.connected = False
		self.thr_watchdog = None

	@retry(Exception, tries=0)
	def connect(self):
		global RUN
		RUN = 1
		
		self.logger.debug("Connect to %s:%i ..." % (self.host, self.port))
		self.conn = amqp.Connection(host=self.host, port=self.port, userid=self.userid, password=self.password, virtual_host=self.virtual_host, insist=False)
		self.pub_chan = self.conn.channel()
		self.pub_chan.exchange_declare(exchange=self.exchange_name, type="topic", durable=True, auto_delete=False)
		
		#self.thr_watchdog = self.thread_watchdog(self)
		#self.thr_watchdog.start()
		
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
	
	def publish(self, msg, routing_key, exchange_name=None):
		if not exchange_name:
			exchange_name = self.exchange_name

		if not self.pub_chan:
			self.pub_chan = self.conn.channel()
			self.pub_chan.exchange_declare(exchange=exchange_name, type="topic", durable=True, auto_delete=False)
		try:
			self.pub_chan.basic_publish(msg,exchange=exchange_name,routing_key=routing_key)
		except:
			self.reinit_connection()

	def reinit_connection(self):
		self.disconnect()
		self.connect()
		if RUN:
			self.logger.debug("Re-open all Queues")
			time.sleep(0.5)
		
	def disconnect(self):
		global RUN
		RUN = 0
			
		if self.connected:
			self.connected = False
			self.logger.debug("Disconnect")
			
			if self.thr_watchdog:
				self.logger.debug("Stop Watchdog thread ...")
				self.thr_watchdog.join()
			
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
		
	class thread_watchdog(threading.Thread):
		def __init__(self, hypamqp):
			threading.Thread.__init__(self)
			self.hypamqp = hypamqp
			
		def run(self):
			while RUN:
				time.sleep(1)
				
		def stop(self):
			pass			

	class thread_waiter(threading.Thread):
		def __init__(self,logger, queue):
			threading.Thread.__init__(self)

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
				msg = None
				try:
					msg = chan.basic_get(queue_name, no_ack=True)
				except Exception, err:
					self.logger.error("Fatal error on AMQP bus connection (%s) !" % err)
					self.stop()
					
				if not msg:
					time.sleep(0.2)
				else:
					callback(msg)
			
		def stop(self):
			#self.logger.debug("Stop thread")
			self.RUN=0
			
			
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
			
			




import threading, time, sys, signal, random, os
from tornado.ioloop import IOLoop
from tornado.ioloop import PeriodicCallback
from stormed import Connection, Message
from stormed.frame import status

import logging

import json

class amqp(threading.Thread):
	VERSION = "0.1a"

	class _worker(threading.Thread):
		def __init__(self, amqp, worker = None):
	                threading.Thread.__init__(self)
			self.amqp = amqp
			self.chan = amqp.chan
			self.thrrun = 1
			self.logger = amqp.logger	
	
			self.logger.debug("Initialising AMQP worker ...")

			if worker != None:
				self.cb_worker = worker
			else:
				self.cb_worker = self._worker
	
		def run(self):
			self.logger.debug("Run worker ...")
			# Safty wait
			time.sleep(1)
			self.cb_worker(self)
			self.logger.debug("Worker run stopped")

		def _worker(self, thr):
			self.logger.debug("Use default worker, sleeping time ...")
			# By default: sleep
	               	while thr.thrrun:
        	               	#self.chan.publish(Message("Hello"), exchange='', routing_key='test2-1.rpc')
				time.sleep(1)

		def get_rpc(self,queue,request,dst,multiple=False,wait_time=1000):
			rpc_id = str(random.random())
			rpc_id = rpc_id[2:]

			self.amqp.rpc_queue[str(rpc_id)] = []

			self.logger.debug("Send RPC request to %s, RPC id: %s" % (dst, rpc_id))
			
			if multiple:
				exchange = "amq.topic"
			else:
				exchange = ""

			self.chan.publish(Message(request, reply_to=queue, correlation_id=str(rpc_id)), exchange=exchange, routing_key=dst)

			start_time = time.time()
			end_time = start_time + (wait_time / 1000)
	
			self.logger.debug("Waiting responses ...")
			while time.time() < end_time and self.thrrun:
				time.sleep(0.001)
				if (not multiple) and len(self.amqp.rpc_queue[str(rpc_id)]) >= 1:
					break
		
			# In ms
			time_elapsed = int((time.time() - start_time) * 1000)

			responses = self.amqp.rpc_queue[str(rpc_id)]
			del self.amqp.rpc_queue[str(rpc_id)]
	
			if len(responses) == 0:
				self.logger.debug("No response in %d ms" % time_elapsed)
				raise NameError('NoResponse')
	
			self.logger.debug("Received %d responses in %d ms" % (len(responses), time_elapsed))
			if not  multiple:
				self.logger.debug("Return single message")
				responses = responses[0]
				
			return responses 
	
	
	        def stop(self):
			self.logger.debug("Stop AMQP worker")
			self.thrrun = 0



        def __init__(self, routing_keys = [], queue_name=None, host='localhost', username='guest', password='guest', vhost='/', port=5672, logging_level=logging.DEBUG, rpc_callback = {}, queue_exclusive = False, queue_passive=False, queue_durable=True, queue_auto_delete=True, autocreate_queue=True):
                threading.Thread.__init__(self)
		
		self.logger = logging.getLogger('amqp')
		self.logger.setLevel(logging_level)

		self.host = host
		self.username = username
		self.password = password
		self.vhost = vhost
		self.port = port
	
                self.conn = Connection(host=host, username=username, password=password, vhost=vhost, port=port)
		self.conn.on_error = self._on_connect_error
		self.conn.on_disconnect = self._on_disconnect

		self.queue_name = queue_name
		self.routing_keys = routing_keys
		self.autocreate_queue = autocreate_queue
		if (queue_name == None):
			self.autocreate_queue = False 

		self.cb_on_connect = self._on_connect
		self.cb_on_queue_declared = self._on_queue_declared
		self.cb_on_message = self._on_message
		self.thr_worker = self._worker
		self.fn_worker = None
	
		self.queue_exclusive = queue_exclusive
		self.queue_passive = queue_passive
		self.queue_durable = queue_durable
		self.queue_auto_delete = queue_auto_delete

		self.rpc_queue = {}

		self.thrrun = 1

		self.rpc_callback = rpc_callback
		self.rpc_callback['PING'] = self.rpc_PING

		self.hello_msg = json.dumps({'type': 'HELLO', 'data': {'time': int(time.time()), 'uid': os.geteuid(), 'gid': os.getegid(), 'pid': os.getpid(), }})

        def run(self):
 	 	self.connect()

		self.io_loop = IOLoop.instance()

		self.heartbeat_scheduler = PeriodicCallback(self.heartbeat, 5000, io_loop=self.io_loop)
		self.heartbeat_scheduler.start()

		#self.stat_scheduler = PeriodicCallback(self.stat, 60000, io_loop=self.io_loop)
		#self.stat_scheduler.start()
		#self.nb_send = 0
		#self.nb_rcv = 0
		#self.send_msg_per_min = 0
		#self.rcv_msg_per_min = 0


		self.logger.debug("Starting IO looping ...")
		self.io_loop.start()
		self.logger.debug("End of run (IO loop stopped) ...")

	#def stat(self):
	#	pass
		

	def heartbeat(self):
		 #self.logger.debug("Heartbeat !")
		 if self.conn.status != status.OPENED and self.conn.status != status.OPENING and self.conn.status != status.CLOSING:
			self.logger.debug("Heartbeat: I try to reconnect ...")
			self.connect()
		

	def connect(self):
		try:
 			self.conn.connect(self.cb_on_connect)
		except:
	    		self.logger.error("Unknown error, impossible to connect ...")

	def disconnect(self):
		self.logger.debug("Disconnect from AMQP")

		
		from_status = self.conn.status

		if self.fn_worker != None:
	   	        self.logger.debug("Stop worker ...")
		        try:
				self.worker.stop()
		        except:
				self.logger.error("Impossible to stop worker, maybe not launched ...")


		self.logger.debug("Close channel ...")
		try:
			self.chan.close()
		except:
			self.logger.warning("Channel maybe allready closed ...")


		self.logger.debug("Close connection ...")
		try:
			#self.conn.close(callback=self._on_connection_close)
			if self.conn.status != status.CLOSED and self.conn.status != status.CLOSING:
				self.conn.close()
			else:
				raise NameError('AllreadyClosed')
		except:
			self.logger.warning("Connection maybe allready closed ...")


		#self.logger.debug("Reset connection ...")
		#self.conn.reset()
	
		self.logger.debug("Connection Status: %s -> %s" % (from_status, self.conn.status))


	def _on_connection_close(self):
		self.logger.debug("Connection is closed")

	def _on_connect_error(self, conn_error):
	    self.logger.error("Connection error %s %s" % (conn_error.reply_code, conn_error.method))
	    self.disconnect()

	def _on_disconnect(self):
	    self.logger.error("You are disconnected")
	    self.conn.reset()
	    #self.disconnect()
	   
	def _on_connect(self):
	    self.logger.debug("Connected to %s" % self.host)
	    
	    self.logger.debug("Creating channel ...")
	    self.chan = self.conn.channel()
	    self.logger.debug("Channel created")

	    if (self.autocreate_queue):
		    self.logger.debug("Creating queue %s ..." % self.queue_name)
		    self.chan.queue_declare(queue=self.queue_name, exclusive=self.queue_exclusive, durable=self.queue_durable, passive=self.queue_passive, auto_delete=self.queue_auto_delete, callback=self.cb_on_queue_declared)

	    if self.fn_worker != None:
		    self.logger.debug("Starting worker ...")
		    self.worker = self.thr_worker(self, self.fn_worker)
	            self.worker.start()


	def _on_queue_declared(self, qinfo):
	    self.logger.debug("Queue created")
	
	    self.logger.debug(" - Name: %s" % qinfo.queue)
	    self.logger.debug(" - Message count: %s" % qinfo.message_count)
	    self.logger.debug(" - Consumer Count: %s" % qinfo.consumer_count)
	
	    self.logger.debug("Binding queue for all routing keys")
	    for routing_key in self.routing_keys:
	    	    self.logger.debug(" - Binding queue on %s" % routing_key)
		    self.chan.queue_bind(exchange='amq.topic', queue=qinfo.queue, routing_key=routing_key)

	    self._consume_queue()

	    self.chan.publish(Message(self.hello_msg, reply_to=self.queue_name), exchange='amq.topic', routing_key=self.queue_name+".HELLO")

	def _consume_queue(self):
	    	self.logger.debug("Consume Queue %s" % self.queue_name)
		self.chan.consume(self.queue_name, self.__on_message, no_ack=True)

		
	
	def __on_message(self, msg):
	    if msg.reply_to != self.queue_name:
		    ## For RPC
		    if self.rpc_queue.has_key(str(msg.correlation_id)):
		    		self.logger.debug(" - Receive response from %s for RPC id: %s" % (msg.reply_to, msg.correlation_id))
		    else:
			    if len(self.rpc_callback) > 0:
				try:
					self._on_message_rpc_parser(msg)
				except:
					self.cb_on_message(self, msg)
			    else:
		 	    	self.cb_on_message(self, msg)
	    else:
		self.logger.warning("Ignore message, it's send by me ...")

	def _on_message(self, reself, msg):
	    #print " [x] %r:%r" % (msg.rx_data.routing_key, msg.body)
	    pass
       

	def _on_message_rpc_parser(self, msg):
		sender = msg.reply_to
		correlation_id = msg.correlation_id
		try:	
			body_json = json.loads(msg.body)
			message_type = body_json['rpc']
		except:
			#self.logger.error("Invalid JSON ...")
			raise NameError('InvalidContent')
		
	    	
		self.logger.debug("RPC Parse %s" % message_type )
	
		try:	
			if self.rpc_callback.has_key(message_type):
				self.logger.debug("Handler found")
				resp = self.rpc_callback[message_type](msg)
			else:
				self.logger.warning("No handler found for %s" % message_type)
				resp = {'code': 404, 'data': 'Handler not found'}

			self.chan.publish(Message(json.dumps(resp), reply_to=self.queue_name, correlation_id=correlation_id), exchange='', routing_key=sender)
		except:
			self.logger.error("Error in RPC parsing ...")
			raise NameError('Error')

	def rpc_PING(self, msg):
		self.logger.debug("Proceed RPC Ping")
		rpc = list(self.rpc_callback.keys())

		response = {'code': 200, 'data': {'amqp_version': self.VERSION, 'rpc': rpc }}
		return response
 
	def stop(self):

	    	self.logger.debug("Stop worker ...")
		try:
			self.worker.stop()
		except:
			self.logger.error("Impossible to stop worker, maybe not launched ...")

		self.thrrun = 0
		
		self.disconnect()
	
   	        self.logger.debug("Stop schedulers ...")
	        try:
			#self.stat_scheduler.stop()
			self.heartbeat_scheduler.stop()
	        except:
			self.logger.error("Impossible to stop schedulers, maybe not launched ...")

		self.io_loop.stop()


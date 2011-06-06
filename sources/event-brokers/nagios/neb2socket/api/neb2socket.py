#!/usr/bin/env python

import socket, json, asyncore, logging

class neb2socket(asyncore.dispatcher):
	def __init__(self, socket_path, msg_callback=None, msg_maxsize=128, msg_maxsize_auto=False, msg_maxsize_step=128, logging_level=logging.ERROR):
		asyncore.dispatcher.__init__(self)

		self.socket_path = socket_path
		self.msg_maxsize = msg_maxsize
		self.msg_maxsize_max = 1024 * 1024
		self.msg_maxsize_auto = msg_maxsize_auto
		self.msg_maxsize_step = msg_maxsize_step
		self.msg_callback = msg_callback

		logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )

		self.logger = logging.getLogger("neb2socket")
		self.logger.setLevel(logging_level)

		asyncore.socket_map.clear()
		self.create_socket(socket.AF_UNIX, socket.SOCK_STREAM)

		self.tmp = None	

		self.connect(self.socket_path)
		

	def handle_connect(self):
		self.logger.debug("Connected to socket '%s'" % self.socket_path)
		pass

	def handle_close(self):
		self.close()
		self.logger.debug("Connection closed")

	def handle_read(self):
		#self.logger.debug("Wait Events ... ")
		answer = self.recv(self.msg_maxsize)

		events = answer.split('\n')

		for event in events:
			if event:
				try:
					dictevent = json.loads(event)
					#self.logger.debug("New Event: " + event)
					#print repr(dictevent)
					if self.msg_callback:
						 self.msg_callback(dictevent)
					self.tmp = None
				except:
					#print "Error in json formatting ..."
					#print "RAW:", event
					firstchar = event[0:1]
					if firstchar != "{" and self.tmp:
						
						self.tmp = self.tmp + event

						#self.logger.debug("event: %s" % event)
						
						event = self.tmp
						firstchar = event[0:1]
						lastchar = event[len(event)-1:]
								
						if firstchar == "{" and lastchar == "}":	
							try:
								dictevent = json.loads(event)
								#self.logger.debug("Successfully event's reconstruction")
								#self.logger.debug("New Event: " + event)
								self.tmp = None
								
								try:
									if self.msg_callback:
										self.msg_callback(dictevent)
								except:
									self.logger.warn("Error in your callback function ...")
									
								# Increase input buffer
								if self.msg_maxsize_auto and self.msg_maxsize <= self.msg_maxsize_max:
									self.msg_maxsize = self.msg_maxsize + self.msg_maxsize_step
									self.logger.warn("Increase 'msg_maxsize' to %i Bytes" % self.msg_maxsize)
									
							except:
								self.logger.error("Error in event's reconstruction !!")
								self.logger.error("Reconstructed Event: " + event)
								self.tmp = None
					else:
						self.tmp = event

	def writable(self):
		pass

	def handle_write(self):
		pass

	def stop(self):
		self.logger.debug("Stop asyncore")
		asyncore.socket_map.clear()
		raise asyncore.ExitNow


#!/usr/bin/env python

import time
import json
import logging

from crecord_ng import crecord_ng

class cconfig(crecord_ng):
	def __init__(self, logging_level=logging.INFO, *args, **kargs):

		self.logger = logging.getLogger('config')
		self.logger.setLevel(logging_level)

		## Default vars
		## Init
		crecord_ng.__init__(self, type='config', logging_level=logging_level, *args, **kargs)

	## SET
	def set(self, varname, value):
		self.logger.debug("Set: %s = '%s'" % (varname, value))
		self.data[varname] = value

	def setstring(self, varname, value):
		self.set(varname, str(value))

	def setint(self, varname, value):
		self.set(varname, int(value))

	def setfloat(self, varname, value):
		self.set(varname, float(value))

	def setbool(self, varname, value):
		self.set(varname, bool(value))

	## GET
	def get(self, varname, default=None):
		try:
			value = self.data[varname]
		except:
			value = default

		self.logger.debug("Get: '%s', return '%s'" % (varname, value))
		return value

	def getstring(self, varname, default=''):
		return str(self.get(varname, default))

	def getint(self, varname, default=0):
		return int(self.get(varname, default))

	def getfloat(self, varname, default=0.0):
		return float(self.get(varname, default))

	def getbool(self, varname, default=False):
		return bool(self.get(varname, default))
	
	

#!/usr/bin/env python

import time
import json
import logging

from crecord_ng import crecord_ng

class cconfig(crecord_ng):
	def __init__(self, logging_level=logging.INFO, *args, **kargs):

		## Default vars
		## Init
		crecord_ng.__init__(self, type='config', *args, **kargs)

	## SET
	def set(self, varname, value):
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
			return self.data[varname]
		except:
			return default

	def getstring(self, varname, default=''):
		return str(self.get(varname, default))

	def getint(self, varname, default=0):
		return int(self.get(varname, default))

	def getfloat(self, varname, default=0.0):
		return float(self.get(varname, default))

	def getbool(self, varname, default=False):
		return bool(self.get(varname, default))
	
	

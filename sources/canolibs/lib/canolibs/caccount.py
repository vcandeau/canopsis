#!/usr/bin/env python

import time
#import logging

class caccount(object):
	def __init__(self, user=None, group=None, groups=[]):

		if user:
			self.user=user
			self.group = group
			self.groups= groups
		else:
			self.user="anonymous"
			self.group ="anonymous"
			self.groups=[]
			

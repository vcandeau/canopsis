#!/usr/bin/env python

from ccmd import ccmd
from ccmd import cbrowser
from caccount import caccount

import os

class cli(ccmd):
	def __init__(self, prompt):
		self.myprompt = prompt + 'storage'
		ccmd.__init__(self, self.myprompt)

	def do_cd(self, namespace):
		cbrowser(self.myprompt + '/' +  namespace, caccount(user="root", group="root"), namespace).cmdloop()

	def do_mongo(self, line):
		os.system('mongo canopsis')

def start_cli(prompt):
	try:
		mycli = cli(prompt)
		mycli.cmdloop()
	except Exception, err:
		print "Impossible to start module: %s" % err

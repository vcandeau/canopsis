#!/usr/bin/env python

from ccmd import ccmd

from csla import csla


from caccount import caccount

class cli(ccmd):
	def __init__(self, prompt):
		ccmd.__init__(self, prompt + 'sla')


def start_cli(prompt):
	try:
		mycli = cli(prompt)
		mycli.cmdloop()
	except Exception, err:
		print "Impossible to start module: %s" % err

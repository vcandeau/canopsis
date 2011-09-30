#!/usr/bin/env python

import logging
import time

from cstorage import cstorage
from cperfstore import cperfstore
from caccount import caccount

from ctimer import ctimer
import sys

if __name__ == "__main__":
	storage = cstorage(caccount(user="root", group="root"), namespace='perfdata')

	timer = ctimer(logging_level=logging.DEBUG)

	perfstore = cperfstore(storage=storage,logging_level=logging.INFO)

	timer.start()
	print "Begin purge ..."
	args = list(sys.argv)
	args.pop(0)

	for arg in args:
		print "+ Purge '%s'" % arg
    		perfstore.purge(arg)
	timer.stop()	
	

	



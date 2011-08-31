#!/usr/bin/env python

import cmd, readline

import os, sys
from datetime import datetime
import logging

from cstorage import cstorage
import crecord

## Main object
class ccmd(cmd.Cmd):
	def __init__(self, prompt):
		cmd.Cmd.__init__(self)
		self.prompt = prompt + '> '

	def do_quit(self, line):
		return True

	def help_quit(self):
		print "Exit CLI"

	def help_help(self):
		print "Show help message (type help <topic>)"

	# shortcuts
	do_exit = do_quit
	help_exit = help_quit


class cbrowser(ccmd):
	def __init__(self, prompt, account, namespace='object', crecord_type=None):
		ccmd.__init__(self, prompt)
		self.account = account
		self.namespace = namespace
		self.crecord_type = crecord_type
		self.storage = cstorage(account, namespace=namespace, logging_level=logging.INFO)

	def do_ls(self, crecord_type=None):
		if   self.crecord_type:
			records = self.storage.find({'crecord_type': self.crecord_type})
		elif crecord_type:
			records = self.storage.find({'crecord_type': crecord_type})
		else:
			records = self.storage.find()

		self.print_records(records)

	def do_cat(self, _id):
		try:
			if _id == '*':
				pass
			else:
				record = self.storage.get(_id)
				record.cat()
		except Exception, err:
			print "Impossible to cat",_id,":", err

	def do_rm(self, _id):
		try:
			self.storage.remove(_id)
		except Exception, err:
			print "Impossible to remove", _id,":", err

	def do_cd(self, path):
		if path == "..":
			return True

	def print_records(self, records):
		print "Total:", len(records)
		for record in records:
			line = []

			line.append(crecord.access_to_str(record.access_owner))
			line.append(crecord.access_to_str(record.access_group))
			line.append(crecord.access_to_str(record.access_other))
			line.append(crecord.access_to_str(record.access_unauth))

			line.append(record.owner)
			line.append(record.group)

			line.append(str(sys.getsizeof(record)))

			date = datetime.fromtimestamp(record.write_time)
			line.append(str(date))

			line.append(record.type)

			line.append(str(record._id))

			self.columnize(line, displaywidth=200)


	

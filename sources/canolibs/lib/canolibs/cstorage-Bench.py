#!/usr/bin/env python

from cstorage import cstorage
from crecord import crecord
from caccount import caccount
from ctimer import ctimer

import logging, random

def go(account, nb):
	storage.default_account=account
	## Insert 1000 records
	insert_nb = nb
	timer.start()
	for i in range(0, insert_nb):
		record = crecord({'number': i})
		storage.put(record)
	timer.stop()
	insert_speed = int(insert_nb / timer.elapsed)
	
	## Read all records
	timer.start()
	records = storage.find()
	timer.stop()
	read_nb = len(records)
	read_speed = int(read_nb / timer.elapsed)

	## Update records
	new_records = []
	for record in records:
		record.data = {'check': 'update'}
		new_records.append(record)

	update_nb = len(new_records)
	timer.start()
	records = storage.put(new_records)
	timer.stop()
	update_speed = int(update_nb / timer.elapsed)

	## Remove all records
	timer.start()
	storage.remove(records)
	timer.stop()
	remove_nb = len(records)
	remove_speed = int(remove_nb / timer.elapsed)
	
	print " + Insert Speed:",insert_speed,"records/s (%s records)" % insert_nb
	print " + Read Speed:",read_speed,"records/s (%s records)" % read_nb
	print " + Update Speed:",update_speed,"records/s (%s records)" % update_nb
	print " + Remove Speed:",remove_speed,"records/s (%s records)" % remove_nb



namespace = "bench-"+str(random.randint(0,1000))
account = caccount()
storage = cstorage(default_account=account, namespace=namespace, logging_level=logging.INFO)
timer = ctimer(logging_level=logging.INFO)

print "Bench with 'anonymous' account ..."
account = caccount()
go(account, 5000)

print "Bench with 'root' account ..."
account = caccount(user="root", group="root")
go(account, 5000)

storage.drop_namespace(namespace)

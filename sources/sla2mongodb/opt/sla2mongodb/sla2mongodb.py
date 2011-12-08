#!/usr/bin/env python
# --------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------

import time
import logging

from camqp import camqp, files_preserve
from txamqp.content import Content

from pymongo import Connection
import json

from cstorage import cstorage
from crecord import crecord
from caccount import caccount

from cavailability import cavailability
from csla import csla

import cevent

from twisted.internet import reactor, task

########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "sla2mongodb"
DAEMON_TYPE = "engine"

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)
myamqp = None

DEFAULT_ACCOUNT = caccount(user="root", group="root")

SLA_RTIME = 300
SEL_RTIME = 300

########################################################
#
#   Functions
#
########################################################


#### Connect signals
RUN = 1
import signal
def signal_handler(signum, frame):
	logger.warning("Receive signal to stop daemon...")
	global RUN
	RUN = 0
 

def calcul_all_availability():
	
	logger.debug("Refresh 'Availability' list ...")
	SELS = []
	records = storage.find({'crecord_type': 'availability'})
	for record in records:
		availability = cavailability(storage=storage, record=record, logging_level=logging.DEBUG)
		SELS.append(availability)


	logger.debug("Launch calculs on all 'Availability'")
	for availability in SELS:
		logger.debug(" + Calcul availability for "+availability.name)
		availability.get_current_availability()

		# Publish availability event
		event = availability.make_event()
		rk = cevent.get_routingkey(event)
		
		msg = Content(json.dumps(event))
		amqp.publish(msg, rk, amqp.exchange_name_events)

	logger.debug(" + End of calculs")
		
			

def calcul_all_sla():	

	logger.debug("Refresh SLA list ...")
	SLAS = []
	records = storage.find({'crecord_type': 'sla', 'active': True})
	for record in records:
		sla = csla(storage=storage, record=record, logging_level=logging.DEBUG)
		SLAS.append(sla)
	
	logger.debug("Launch calculs on all SLA")
	for sla in SLAS:
		logger.debug(" + Calcul sla for "+sla._id)
		sla.get_sla()
		
		# Publish sla event
		event = sla.make_event()
		rk = cevent.get_routingkey(event)

		msg = Content(json.dumps(event))	
		amqp.publish(msg, rk, amqp.exchange_name_events)

	logger.debug(" + End of calculs")
			

########################################################
#
#   Main
#
########################################################

amqp=None
storage=None

def main():
	signal.signal(signal.SIGINT, signal_handler)
	signal.signal(signal.SIGTERM, signal_handler)
	global amqp, storage

	storage = cstorage(DEFAULT_ACCOUNT, namespace='object', logging_level=logging.INFO)

	## Tasks
	slaTask = task.LoopingCall(calcul_all_sla)
	avaTask = task.LoopingCall(calcul_all_availability)

	# AMQP
	amqp = camqp()
	amqp.start()

	## Refresh SLA list all 5 minutes
	slaTask.start(SLA_RTIME)
	avaTask.start(SEL_RTIME)

	while RUN:
		time.sleep(1)

	slaTask.stop()
	avaTask.stop()

	amqp.stop()
	amqp.join()

if __name__ == "__main__":
	main()

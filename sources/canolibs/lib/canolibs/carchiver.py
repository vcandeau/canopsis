#!/usr/bin/env python
#--------------------------------
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

import logging, time
from cstorage import get_storage
from caccount import caccount
from crecord import crecord

from ctools import legend

legend_type = ['soft', 'hard']

class carchiver(object):
	def __init__(self, namespace, storage=None, autolog=False, logging_level=logging.ERROR):

		self.logger = logging.getLogger('carchiver')

		self.namespace = namespace
		self.namespace_log = namespace + '_log'

		self.autolog = autolog

		self.logger.debug("Init carchiver on %s" % namespace)

		self.account = caccount(user="root", group="root")

		if not storage:
			self.logger.debug(" + Get storage")
			self.storage = get_storage(namespace=namespace, logging_level=logging_level)
		else:
			self.storage = storage

	def check_event(self, _id, event):
		changed = False

		self.logger.debug(" + Event:")

		state = event['state']
		state_type = event['state_type']

		self.logger.debug("   - State:\t\t'%s'" % legend[state])
		self.logger.debug("   - State type:\t'%s'" % legend_type[state_type])


		try:
			# Get old record
			record = self.storage.get(_id, account=self.account)
			self.logger.debug(" + Check with old record:")
			old_state = record.data['state']
			old_state_type = record.data['state_type']

			self.logger.debug("   - State:\t\t'%s'" % legend[old_state])
			self.logger.debug("   - State type:\t'%s'" % legend_type[old_state_type])

			if state != old_state or state_type != old_state_type:
				self.logger.debug(" + Event has changed !")
				changed = True
			else:
				self.logger.debug(" + No change.")

		except:
			# No old record
			self.logger.debug(" + New event")
			changed = True
		
		record = crecord(event)
		record.type = "event"
		record.chmod("o+r")
		record._id = _id

		self.storage.put(record, namespace=self.namespace, account=self.account)

		if changed and self.autolog:
			self.log_event(_id, event)			

		return changed

	def log_event(self, _id, event):
		self.logger.debug("Log event '%s' in %s ..." % (_id, self.namespace_log))
		record = crecord(event)
		record.type = "event"
		record.chmod("o+r")
		record.data['event_id'] = _id
		record._id = _id + '.' + str(time.time())

		self.storage.put(record, namespace=self.namespace_log, account=self.account)

	def get_logs(self, _id, start=None, stop=None):
		return self.storage.find({'event_id': _id}, namespace=self.namespace_log, account=self.account)

	def remove_all(self):
		self.logger.debug("Remove all logs and state archives")

		self.storage.drop_namespace(self.namespace)
		self.storage.drop_namespace(self.namespace_log)
		
	

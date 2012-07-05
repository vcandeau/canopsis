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

from cengine import cengine
from cstorage import get_storage
from caccount import caccount
from cselector import cselector

import logging
		
NAME="selector"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		self.selectors = {}
		
		self.nb_beat_interval = 900
		self.nb_beat = 0
	
	def pre_run(self):
		#load selectors
		self.storage = get_storage(namespace='object', account=caccount(user="root", group="root"))
		self.load_selectors()
		
	def unload_all_selectors(self):
		self.logger.debug("Unload all selectors")
		records = self.storage.find({'crecord_type': 'selector'})
		for record in records:
			record.data["loaded"] = False
			
		# Save
		self.storage.put(records, namespace="object")

	def clean_selectors(self):
		## check if selector is already in store
		id_to_clean = []
		ids = [_id for _id in self.selectors]
		
		count = self.storage.count({'_id': {"$in": ids}}, namespace="object")
		if count != len(ids):
			for _id in self.selectors:
				if not self.storage.count({'_id': _id}, namespace="object"):
					id_to_clean.append(_id)
				
			for _id in id_to_clean:
				self.logger.debug("Clean selector %s: %s" % (_id, self.selectors[_id].name))
				del self.selectors[_id]
	
	def unload_selectors(self):
		self.clean_selectors()
		
		## Unload selectors
		if self.selectors:
			for _id in self.selectors:
				selector = self.selectors[_id]
				record = self.storage.get(selector._id)
				self.logger.debug("Unload selector %s: %s" % (record._id, record.name))
				record.data["loaded"] = False
				self.storage.put(record)
				del selector
				
		self.selectors = []
	
	def load_selectors(self):
		## Load selectors
		self.clean_selectors()
		
		## New selector or modified selector
		records = self.storage.find({'$and': [{'crecord_type': 'selector'}, {'loaded': False}]}, namespace="object")
		
		for record in records:
			self.logger.debug("Load selector %s: %s" % (record._id, record.name))
			_id = record._id
			try:
				selector = self.selectors[_id]
				## Delete old
				del self.selectors[_id]
			except:
				pass
				
			## store
			self.selectors[_id] = cselector(storage=self.storage, record=record, logging_level=logging.INFO)
		
			## Publish state	
			(rk, event) = self.selectors[_id].event()
			if event:
				self.amqp.publish(event, rk, self.amqp.exchange_name_events)
			
			# Set loaded
			record.data["loaded"] = True
			
		# Save
		self.storage.put(records, namespace="object")

	def beat(self):
		self.nb_beat +=1
		
		## Send event all self.beat_interval seconds
		if self.nb_beat >= (self.nb_beat_interval/self.beat_interval):
			self.nb_beat = 0
			for _id in self.selectors:
				selector = self.selectors[_id]
				(rk, event) = selector.event()
				if event:
					self.amqp.publish(event, rk, self.amqp.exchange_name_events)
				else:
					pass
					
		self.load_selectors()
		
	def get_selectors(self, _id):
		if not self.selectors:
			return []
			
		selectors = []
		for sid in self.selectors:
			selector = self.selectors[sid]
			if selector.match(_id):
				selectors.append(selector)
			
		return selectors
		
	def work(self, event, msg):
		event_id = event["event_id"]
						
		## Process selector
		selectors = self.get_selectors(event_id)
		if not selectors:
			return event
			
		for selector in selectors:
			(rk, sevent) = selector.event()
			if sevent:
				self.amqp.publish(sevent, rk, self.amqp.exchange_name_events)
			else:
				pass
		
		return event
		
	def post_run(self):
		self.unload_selectors()

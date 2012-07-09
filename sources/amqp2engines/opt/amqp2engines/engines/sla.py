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
from caccount import caccount
from cstorage import get_storage
from pyperfstore import node
from pyperfstore import mongostore
import time

NAME="sla"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.create_queue = False
		self.send_stats_event = False
		
		self.beat_interval =  10
		
		self.slas = []
		self.configs = {}
		
		self.resource = "sla"
		
		self.perfstorage = mongostore(mongo_collection='perfdata')

	def pre_run(self):
		#load sla
		self.storage = get_storage(namespace='object', account=caccount(user="root", group="root"))
		self.load_sla()

	def clean_sla(self):
		id_to_clean = []
				
		count = self.storage.count({'_id': {"$in": self.slas}}, namespace="object")
		if count != len(self.slas):
			for _id in self.slas:
				if not self.storage.count({'$and': [{'_id': self.storage.clean_id(_id)}, {'sla': True}]}, namespace="object"):
					self.logger.debug("Unload sla %s" % _id)
					id_to_clean.append(_id)
					
		for _id in id_to_clean:
			del self.configs[_id] 
				
		self.slas= [_id for _id in self.slas if _id not in id_to_clean]
				
	def load_sla(self):
		records = self.storage.find({'$and': [{'crecord_type': 'selector'}, {'sla': True}, {'rk': { '$exists' : True }} ]}, namespace="object")
		
		for record in records:
			if record._id not in self.slas:
				_id = record._id
				rk = record.data['rk']
				self.logger.debug("Load sla %s: %s (%s)" % (_id, record.name, rk))
				self.slas.append(_id)
				self.configs[_id] = record.data
		
	def beat(self):
		self.logger.debug("Beat !")
		self.clean_sla()
		self.load_sla()
		
		for _id in self.slas:
			config = self.configs[_id]	
			rk = config['rk']
			self.logger.debug("Get States of %s (%s)" % (_id, rk))
			
			
			sla_interval   = config.get('sla_interval', (60*60)) # 1h
			sla_lastcalcul = config.get('sla_lastcalcul', int(time.time() - sla_interval))
			
			stop = int(time.time())
			start = sla_lastcalcul
			
			self.logger.debug(" + sla_lastcalcul: %s" % sla_lastcalcul)
			self.logger.debug(" + start:          %s" % start)
			self.logger.debug(" + stop:           %s" % stop)
			
			#Load perfstore Node
			mynode = config.get('pnode', None)
			if not mynode:
				mynode = node(_id=rk, storage=self.perfstorage)
				config['pnode'] = mynode
		
			# Get Values
			points = mynode.metric_get_values(
					dn="cps_state",
					tstart=start,
					tstop=stop,
					aggregate=False
				)
			
			states = {0: 0, 1:0, 2:0, 3:0}
			# Split states
			for point in points:
				timestamp = point[0]
				value = point[1]
				
				# cps_state = state * 100 + state_type * 10 + state_extra
				state = int(str(value)[0])
				state_type = int(str(value)[1])
				extra = int(str(value)[2])
				
				self.logger.debug(" + %s: state: %s, state_type: %s, extra: %s" % (timestamp, state, state_type, extra))
		
		

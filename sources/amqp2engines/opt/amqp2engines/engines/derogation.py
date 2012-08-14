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
import logging
from cengine import cengine
from cstorage import get_storage
from caccount import caccount

NAME="derogation"


class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
		
		self.rules = {}
		
		#self.beat_interval =  900
		
	def load_rules(self):
		
		
		
		
	def pre_run(self):
		self.storage = get_storage(namespace='events', account=caccount(user="root", group="root"))
		self.load_rules()
		
	def beat(self):
		pass
		
	def work(self, event, *args, **kargs):
		return event

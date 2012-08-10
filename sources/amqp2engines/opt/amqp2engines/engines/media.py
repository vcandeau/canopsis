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
from cfile import cfile
import cevent
import time
import base64


NAME="media"

states_str = ("Ok", "Warning", "Critical", "Unknown")
states = {0: 0, 1:0, 2:0, 3:0}

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
        
	def pre_run(self):
                self.storage = get_storage(namespace='files', account=caccount(user="root", group="root"))
       
	def work(self, event, *args, **kargs):
		if ( event.has_key('media_bin') ):
			saveFile = cfile(storage=self.storage)
			binData = event['media_bin'] 
			mediaName = event['media_name']
			mediaType = event['media_type']
			saveFile.put_data(binData, mediaName, "image/png")
			id = self.storage.put(saveFile)
			if ( not saveFile.check(self.storage) ) :
				logger.error('Report not in grid fs')
			else:
				event['media_id'] = str(id)
			event.pop('media_bin')
		return event
					
	

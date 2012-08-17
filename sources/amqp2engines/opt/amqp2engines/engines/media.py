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
from cfile import cfile
import base64

NAME="media"

class engine(cengine):
	def __init__(self, *args, **kargs):
		cengine.__init__(self, name=NAME, *args, **kargs)
        
	def pre_run(self):
		self.storage = get_storage(namespace='files', account=caccount(user="root", group="root"))
       
	def work(self, event, *args, **kargs):
		
		binData = event.get('media_bin', None)
		if binData:
			del event['media_bin']
			
			mediaName = event.get('media_name', None)
			
			# Todo
			#mediaType = event.get('media_type', "image/png")
			mediaType = "image/png"
			
			event['media_id'] = None

			if mediaName:
				self.logger.debug("mediaName: %s" % mediaName)
				self.logger.debug("mediaType: %s" % mediaType)
				self.logger.debug("binData type: %s" % type(binData))
				try:
					saveFile = cfile(storage=self.storage)
					saveFile.put_data(binData, mediaName, mediaType )
					
					_id = saveFile.save()
						
					if not _id:
						self.logger.error('No id, error in save process')
					else:
						event['media_id'] = str(_id)
							
				except Exception, err:
					self.logger.error('Impossible to save media (%s)' % err)
			else:
				self.logger.error("Impossible to find 'media_name' field")
			
		return event
					
	

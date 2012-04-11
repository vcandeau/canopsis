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
import logging

#from task_reporting import render_pdf

logger = logging.getLogger("aps_to_celery")

def launch_celery_task(*args,**kwargs):
	if kwargs.has_key('task') and kwargs.has_key('method'):
		try:
			module = __import__(kwargs['task'])
			exec "task = module.%s" % kwargs['method']
			
			methodargs = kwargs
			del methodargs['task']
			del methodargs['method']
			
			#print(args)
			#print(kwargs)
			
			result = task.delay(*args,**methodargs)

			return result
			
		except Exception, err:
			logger.error('%s' % err)
	else:
		logger.error('No task given')
		
	
	
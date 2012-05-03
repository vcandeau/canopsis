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

from cinit import cinit
from caccount import caccount
from cstorage import cstorage
from crecord import crecord

import time
from camqp import camqp
import cevent

init 	= cinit()
logger = init.getLogger('aps')

def launch_celery_task(*args,**kwargs):
	if kwargs.has_key('task') and kwargs.has_key('method'):
		try:
			#----------Get task informations
			task_name = kwargs['_scheduled']
			
			module = __import__(kwargs['task'])
			exec "task = module.%s" % kwargs['method']
			
			#-------------Clear arguments
			methodargs = kwargs
			del methodargs['task']
			del methodargs['method']
			del kwargs['_scheduled']
			
			#-------------execute task
			try:
				result = task.delay(*args,**methodargs)
				result.get()
				
				success = True
				logger.info(result)
			except Exception, err:
				success = False
				function_error = str(err)
				logger.error(err)

			#------------Get account and storage
			try:
				if isinstance(kwargs['account'],unicode):
					account = caccount(user=kwargs['account'])
				else:
					account = kwargs['account']
				logger.info('Caccount create from passed arguments')
			except:
				logger.info('No account specified in the task')
				account = caccount()
			
			storage = cstorage(account=account, namespace='task_log')
			taskStorage = cstorage(account=account, namespace='task')
			
			#-------------Check if function have succeed
			

			return result
			
		except Exception, err:
			logger.error('%s' % err)
	else:
		logger.error('No task given')
		
	
	

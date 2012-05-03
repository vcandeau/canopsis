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
				if isinstance(kwargs['account'],unicode) or isinstance(kwargs['account'],str):
					account = caccount(user=kwargs['account'])
				else:
					account = kwargs['account']
				logger.error(account)
				logger.info('Caccount create from passed arguments')
			except:
				logger.info('No account specified in the task')
				account = caccount()
			
			storage = cstorage(account=account, namespace='task_log')
			taskStorage = cstorage(account=account, namespace='task')
			
			timestamp = int(time.time())
			
			#-------------Check if function have succeed
			if success:
				if isinstance(result, list):
					data = result
				else:
					data = [str(result)]

				log = {	'success': True,
						'total': len(data),
						'output':'Task done',
						'timestamp': timestamp,
						'data': data
						}
				logger.info('Task was a success')
			else:
				log = {	'success': False,
						'total': 0,
						'output': [ str(function_error) ],
						'timestamp':timestamp,
						'data': []
					  }
				logger.info('Task have failed')
				
			#-----------------Put log in schedule attribut----------------
			try:
				mfilter = {'crecord_name':task_name}
				search = taskStorage.find_one(mfilter)

				if search:
					search.data['log'] = log
					taskStorage.put(search)
					logger.info('Task log updated')
				else:
					logger.error('Task not found in db, can\'t update')
			except Exception, err:
				logger.error('Error when put log in task_log %s' % err)
			
			#-------------------------Put log in db-------------------------
			try:
				log_record = crecord(log,name=task_name)
				storage.put(log_record)
				logger.info('log put in db')
			except Exception,err:
				logger.error('log not added to db, reason : %s' % err)
			
			#---------------------Publish amqp event-------------
			# Publish Amqp event
			if success:
				status=0
			else:
				status=1

			event = cevent.forger(
				connector='celery',
				connector_name='task_log',
				event_type='log',
				source_type='resource',
				output=log['output'],
				state=status
				)
			logger.debug('Send Event: %s' % event)
			key = cevent.get_routingkey(event)
			
			amqp = camqp()
			amqp.start()
			
			amqp.publish(event, key, amqp.exchange_name_events)
			
			amqp.stop()
			amqp.join()
			
			logger.info('Amqp event published')

			#--------------------return result-------------------
			return log
			
		except Exception, err:
			logger.error('%s' % err)
	else:
		logger.error('No task given')
		
	
	

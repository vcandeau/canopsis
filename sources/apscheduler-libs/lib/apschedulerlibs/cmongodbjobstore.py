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
from apscheduler.jobstores.mongodb_store import MongoDBJobStore
from apscheduler.triggers import CronTrigger,IntervalTrigger,SimpleTrigger
from apscheduler.job import Job

from datetime import datetime,timedelta

import logging

try:
    import cPickle as pickle
except ImportError:  # pragma: nocover
    import pickle

logger = logging.getLogger('MongoDbStore')
logger.setLevel(logging.DEBUG)
class CMongoDBJobStore(MongoDBJobStore):
	
	def __init__(self, database='apscheduler', collection='jobs',connection=None, pickle_protocol=pickle.HIGHEST_PROTOCOL,**connect_args):
		MongoDBJobStore.__init__(self,database=database, collection=collection,connection=connection, pickle_protocol=pickle_protocol)
		self.mongo_collection_count = None
	
	def load_jobs(self):
		#count on first load
		if self.mongo_collection_count == None:
			self.mongo_collection_count = self.collection.count()
		
		#continue standart execution
		jobs = []
		for job_dict in self.collection.find():
			try:
				job = Job.__new__(Job)
				
				if job_dict['owner'] != root:
					if job_dict['kwargs']['task'] != 'task_reporting':
						raise ValueError('The owner of this task isn\'t allow to run this task')
				
				#keep memory of id
				job_dict_id = job_dict['_id']
				
				job_dict['id'] = job_dict.pop('_id')
				
				if job_dict.has_key('runs'):
					job_dict['runs'] = job_dict['runs']
				else:
					job_dict['runs'] = 0
				
				job_dict['coalesce'] = False
				
				#try to get interval
				try:
					if job_dict['interval'] != None:
						job_dict['trigger'] = IntervalTrigger(timedelta(**job_dict['interval']))
				except Exception, err:
					pass
				
				#try to get simple
				try:
					if job_dict['date'] != None:
						job_dict['trigger'] = SimpleTrigger( datetime(*job_dict['date']))
				except Exception, err:
					pass
				
				#try to get crontab
				try:
					if job_dict['cron'] != None:
						job_dict['trigger'] = CronTrigger(**job_dict['cron'])
				except Exception, err:
					pass

				job_dict['next_run_time'] = job_dict['trigger'].get_next_fire_time(datetime.now())
				job_dict['args'] = job_dict['args']
				job_dict['kwargs'] = job_dict['kwargs']
				job_dict['max_runs'] = None
				job_dict['max_instances'] = 3
				job_dict['name'] = job_dict['crecord_name']
				job_dict['misfire_grace_time'] = 1
				
				job_dict['func_ref'] = 'apschedulerlibs.aps_to_celery:launch_celery_task'
				
				job.__setstate__(job_dict)
				jobs.append(job)
				
				#change flag to true
				self.collection.update({'_id':job_dict_id},{"$set":{'loaded':True}},True)
				
			except Exception:
				job_name = job_dict.get('name', '(unknown)')
				logger.exception('Unable to restore job "%s"', job_name)
		self.jobs = jobs

	def check_and_refresh(self):
		if self.mongo_collection_count:
			try:
				count = self.collection.count()
			except Exception, err:
				logger.error('Task count failed : %s' % err)
				
			if self.mongo_collection_count != count:
				try:
					self.load_jobs()
					logger.info('New Task added')
					self.mongo_collection_count = count
				except Exception, err:
					logger.error('Reload jobs failed : %s' % err)

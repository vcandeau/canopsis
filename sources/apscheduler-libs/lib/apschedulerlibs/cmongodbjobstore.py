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

logger = logging.getLogger('MongoDbStore')

class CMongoDBJobStore(MongoDBJobStore):
	def load_jobs(self):
		jobs = []
		for job_dict in self.collection.find():
			try:
				job = Job.__new__(Job)
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
					logger.info('No interval : %s' % err)
				
				#try to get simple
				try:
					if job_dict['date'] != None:
						job_dict['trigger'] = SimpleTrigger( datetime(*job_dict['date']))
				except Exception, err:
					logger.info('No simple date: %s' % err)
				
				#try to get crontab
				try:
					if job_dict['cron'] != None:
						job_dict['trigger'] = CronTrigger(**job_dict['cron'])
				except Exception, err:
					logger.info('No crontab: %s' % err)

				job_dict['next_run_time'] = job_dict['trigger'].get_next_fire_time(datetime.now())
				job_dict['args'] = job_dict['args']
				job_dict['kwargs'] = job_dict['kwargs']
				job_dict['max_runs'] = None
				job_dict['max_instances'] = 3
				job_dict['misfire_grace_time'] = 1
				job.__setstate__(job_dict)
				jobs.append(job)
			except Exception:
				job_name = job_dict.get('name', '(unknown)')
				logger.exception('Unable to restore job "%s"', job_name)
		self.jobs = jobs

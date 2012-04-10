from apscheduler.jobstores.mongodb_store import MongoDBJobStore
from apscheduler.triggers import CronTrigger
from apscheduler.job import Job

from datetime import datetime

class CMongoDBJobStore(MongoDBJobStore):
	def new_load_jobs(self):
		
		jobs = []
		for job_dict in self.collection.find():
			try:
				job = Job.__new__(Job)
				job_dict['id'] = job_dict.pop('_id')
				
				job_dict['trigger'] = CronTrigger(**job_dict['trigger'])
				job_dict['next_run_time'] = job_dict['trigger'].get_next_fire_time(datetime.now())
				job_dict['args'] = job_dict['args']
				job_dict['kwargs'] = job_dict['kwargs']
				job_dict['max_runs'] = None
				job.__setstate__(job_dict)
				jobs.append(job)
			except Exception:
				job_name = job_dict.get('name', '(unknown)')
				logger.exception('Unable to restore job "%s"', job_name)
		self.jobs = jobs

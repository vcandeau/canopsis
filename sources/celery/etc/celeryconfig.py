import os
from caccount import caccount
from cstorage import cstorage

from datetime import timedelta
from celery.schedules import crontab

def list_tasks(path):
	dirList=os.listdir(path)
	list_tasks = []
	#print(" :: Tasks.d automatically loaded")
	for mfile in dirList:
		ext = mfile.split(".")[1]
		name = mfile.split(".")[0]
		if name != "." and ext == "py" and name != '__init__':
			#print("    + %s" % name)
			list_tasks.append(name)
	return tuple(list_tasks)

def list_crons():
	account = caccount(user='root', group='root')
	storage = cstorage(account, namespace='object')
	records = storage.find({"crecord_type": "schedule"})
	schedules = {}
	for record in records:
		schedule = {}
		schedule['task'] = record.data['task']
		if record.data.has_key('args'):
			schedule['args'] = record.data['args']

		if record.data.has_key('timedelta'):
			ret_timedelta = timedelta(**record.data['timedelta'])
			schedule['schedule'] = ret_timedelta 
		if record.data.has_key('crontab'):
			ret_crontab = crontab(**record.data['crontab'])			
			schedules['schedule'] = ret_schedule
		
		schedules[record.data['name']] = schedule

	return schedules

BROKER_HOST 			= "localhost"
BROKER_PORT 			= 5672
BROKER_USER 			= "guest"
BROKER_PASSWORD			= "guest"
BROKER_VHOST 			= "canopsis"
CELERY_RESULT_BACKEND 	= "amqp"
CELERY_IMPORTS 			= list_tasks('/opt/canopsis/etc/tasks.d')
CELERYBEAT_SCHEDULE		= list_crons()

import os

def list_tasks(path):
	dirList=os.listdir(path)
	list_tasks = []
	print(" :: Tasks.d automatically loaded")
	for mfile in dirList:
		ext = mfile.split(".")[1]
		name = mfile.split(".")[0]
		if name != "." and ext == "py" and name != '__init__':
			print("    + %s" % name)
			list_tasks.append(name)
	return tuple(list_tasks)

def list_crons(path):
	dirList=os.listdir(path)
	dict_crons = {}
	print(" :: Tasks-cron.d automatically loaded")
	for mfile in dirList:
		ext = mfile.split(".")[1]
		name = mfile.split(".")[0]
		if name != "." and ext == "py" and name != '__init__':
			exec("from " + name + " import SCHEDULES")
			print("    + %s" % name)
			dict_crons = dict(dict_crons.items() + SCHEDULES.items())
	return dict_crons

BROKER_HOST 			= "localhost"
BROKER_PORT 			= 5672
BROKER_USER 			= "guest"
BROKER_PASSWORD			= "guest"
BROKER_VHOST 			= "canopsis"
CELERY_RESULT_BACKEND 	= "amqp"
CELERY_IMPORTS 			= list_tasks('/opt/canopsis/etc/tasks.d')
CELERYBEAT_SCHEDULE		= list_crons('/opt/canopsis/etc/tasks-cron.d')

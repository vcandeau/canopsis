def list_tasks(path):
	import os
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

BROKER_HOST 					= "localhost"
BROKER_PORT 					= 5672
BROKER_USER 					= "guest"
BROKER_PASSWORD 			= "guest"
BROKER_VHOST 					= "canopsis"
CELERY_RESULT_BACKEND = "amqp"
CELERY_IMPORTS 				= list_tasks("/opt/canopsis/etc/tasks.d")

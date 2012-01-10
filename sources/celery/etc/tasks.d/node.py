from celery.task import task

@task
def hostname():
	import socket
	return socket.gethostname()

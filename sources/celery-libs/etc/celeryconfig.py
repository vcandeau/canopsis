from celerylibs import listing

BROKER_HOST 			= "localhost"
BROKER_PORT 			= 5672
BROKER_USER 			= "guest"
BROKER_PASSWORD		= "guest"
BROKER_VHOST 			= "canopsis"
CELERY_RESULT_BACKEND = "amqp"
CELERY_IMPORTS 				= listing.tasks('/opt/canopsis/etc/tasks.d')

CELERYD_TASK_TIME_LIMIT = 300

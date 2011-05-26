#!/opt/boa/bin/python
import sys
sys.path.append('/opt/boa/lib')
sys.path.append('/opt/boa/sources/boa/lib')

from stormed import Message
import time, signal, threading, json, logging
from Queue import *
from amqp_2 import amqp


import redis

import re
from datetime import date


########################################################
#
#   Configuration
#
########################################################

DAEMON_NAME = "redis"
DAEMON_TYPE = "dataware"

AMQP_HOST = "localhost"
AMQP_QUEUE_NAME = DAEMON_TYPE+"."+DAEMON_NAME


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s %(name)s %(levelname)s %(message)s',
                    )
logger = logging.getLogger(DAEMON_NAME)


########################################################
#
#   Handler
#
########################################################


#def amqp_worker(worker):
#	while worker.thrrun:
#		time.sleep(1)
		
def amqp_on_message(amqp, msg):
	global NB_WRITE	
	evt_data = json.loads(msg.body)['data']
	redis_value = {}

	if evt_data['source'] == "SERVICE":
		id = evt_data['poller_name'] +":"+ evt_data['host_name'] +":"+ evt_data['service_name']
		#if not redis_db.exists(key):
			#redis_value = {'poller_name': evt_data['poller_name'], 'host_name': evt_data['host_name'], 'service_name': evt_data['service_name'], 'status_key': key}
			#redis_db.hset("services:status", key, json.dumps(redis_value))
		redis_db.sadd("services", id)
		redis_db.sadd("services:"+evt_data['poller_name'], id)
		redis_db.sadd("services:"+evt_data['poller_name']+":"+evt_data['host_name'], id)

		perf_data = evt_data['perf_data']
		if perf_data != '(null)':
			print "######### Perf_data:", perf_data
			perfs = perf_data.split(' ')
			for perf in perfs:
				pref = perf.replace(',','.')
				print "\tperf:", perf
				resultat = re.search('(.*)=([0-9.,]*)(([A-Za-z/]*);?).*',perf);
				metric = resultat.group(1)
				value = resultat.group(2)
				unit = resultat.group(4)
	
				print "\t\tMetric:", metric
				print "\t\tValue:", value
				print "\t\tUnit:", unit
	
				metric_id = id+":"+metric
		
				if (redis_db.exists("perfdata:last_check:"+id)):
					last_check = redis_db.get("perfdata:last_check:"+id)
					interval = int(evt_data['last_check']) - int(last_check)
					redis_db.set("perfdata:interval:"+id, interval)
				else:
					redis_db.set("perfdata:interval:"+id, 0)
		
				#redis_db.hset("perfdata:values:"+metric_id, evt_data['last_check'], value)
				#redis_db.lpush("perfdata:timestamps:"+metric_id, evt_data['last_check'])

				last_check_date = date.fromtimestamp(int(evt_data['last_check']))
				value_id = last_check_date.strftime("%Y%m%d")

				redis_db.hset("perfdata:values:"+value_id+":"+metric_id, evt_data['last_check'], value)
				redis_db.lpush("perfdata:timestamps:"+value_id+":"+metric_id, evt_data['last_check'])

				redis_db.set("perfdata:unit:"+metric_id, unit)
				redis_db.set("perfdata:last_check:"+metric_id, evt_data['last_check'])
				redis_db.sadd("perfdata:metrics:"+id, metric_id)

				print "\t\tRedis Key:", metric_id
	
			print ''
	
	if evt_data['source'] == "HOST":
		id = evt_data['poller_name']+":"+evt_data['host_name']
		#if not redis_db.exists(key):
			#redis_value = {'poller_name': evt_data['poller_name'], 'host_name': evt_data['host_name'], 'service_name': '', 'status_key': key}
			#redis_db.hset("hosts:status", key, json.dumps(redis_value))
		redis_db.sadd("hosts", id)
		redis_db.sadd("hosts:"+evt_data['poller_name'], id)

	if evt_data['source'] == "SERVICE" or evt_data['source'] == "HOST":
		key = "status:"+id
		redis_db.set(key, json.dumps(evt_data))


########################################################
#
#   Functions
#
########################################################

RUN = 1
#### Connect signals
def signal_handler(signum, frame):
	logger.warning("Receive signal to stop daemon...")
	global RUN
	RUN = 0
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


########################################################
#
#   RPC Functions
#
########################################################


########################################################
#
#   Main
#
########################################################

## Redis
redis_db = redis.Redis(host='localhost', port=6379, db=0)


## AMQP
thr_amqp = amqp(
	host = AMQP_HOST,
	queue_name = AMQP_QUEUE_NAME,
	routing_keys = [ DAEMON_TYPE+".broadcast", "broadcast", "poller.*.*.EVENT.#"]
	#logging_level = logging.WARNING,
)

thr_amqp.cb_on_message = amqp_on_message
#thr_amqp.fn_worker = amqp_worker

### Start Main !
thr_amqp.start()

while RUN:
        time.sleep(2)

thr_amqp.stop()

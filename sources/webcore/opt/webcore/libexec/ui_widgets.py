#!/usr/bin/env python

import sys, os, logging, json

import bottle
from bottle import route, get, put, delete, request, HTTPError

## Canopsis
from cstorage import get_storage
from libexec.auth import check_auth, get_account

## Logger
if bottle.debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.INFO
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("ui-widgets")

#########################################################################

#### GET
@get('/ui/widgets', apply=[check_auth])
def get_all_widgets():
	#account = get_account()
	#storage = get_storage(namespace='object')
	
	base_path = os.path.expanduser("~/var/www/canopsis/widgets/")
	output = []

	logger.debug(" + Search all widgets ...")
	for widget in os.listdir(base_path):
		logger.debug("   + Load '%s'" % widget)
		
		widget_path = "%s/%s/" % (base_path, widget)
		try:
			FH = open (widget_path + "/widget.json", 'r' )
			widget_info = FH.read()
			widget_info = json.loads(widget_info)
			
			output.append(widget_info[0])

			FH.close()
			logger.debug("     + Success")
		except:
			logger.debug("     + Failed")
		
	output={'total': len(output), 'success': True, 'data': output}
	return output



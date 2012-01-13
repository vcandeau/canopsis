#!/usr/bin/env python
# --------------------------------
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

import sys, os, logging, json, subprocess
#from gevent import monkey; monkey.patch_all()
import gevent

import bottle
from bottle import route, get, request, HTTPError, post, static_file, response

#gridfs
from pymongo import Connection
import gridfs

import time
from datetime import date

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord

#import protection function
from libexec.auth import check_auth, get_account

logger = logging.getLogger('Reporting')

#########################################################################

#@get('/reporting/',apply=[check_auth])
@get('/reporting/:startTime/:stopTime/:view_name',apply=[check_auth])
def generate_report(startTime, stopTime,view_name):

	#build file name	
	name_array = view_name.split('.')
	file_name = name_array[len(name_array)-1]
	file_name += '_' + str(date.fromtimestamp(int(startTime) / 1000)) +'.pdf'
	file_path = '/opt/canopsis/tmp/report/' + file_name

	# Launch Reporting Celery Task
	try:
		import task_reporting
	except Exception, err:
		logger.debug("Check your celeryconfig.py, if you have reporting task imported")
		logger.debug(err)
	try:
		result = task_reporting.render_pdf.delay(file_name,
										view_name,
										startTime,
										stopTime,
										"/opt/canopsis/etc/wkhtmltopdf_wrapper.json")
	except Exception, err:
		logger.debug(err)

	# Wait the end of the process
	while not result.ready():
		gevent.sleep(1)
	# If file has been rendered
	if os.path.exists(file_path):
		logger.debug('file found, send it')
		try:
			logger.debug("Put report in grid FS")
			result = task_reporting.put_in_grid_fs(file_path,"127.0.0.1",27017,"canopsis","report")  
		except Exception, err:
			logger.debug(err)
		
		#put_in_grid_fs(file_path)
		os.remove(file_path)
		return {'total': 1, 'success': True, 'data': { 'url' : '/getReport/' + file_name }}
	else:
		logger.debug('file not found, error while generating pdf')
		return {'total': 0, 'success': False, 'data': {}}
	
	
#@get('/getReport/',apply=[check_auth])
#@get('/getReport/:fileName',apply=[check_auth])
#def get_report(fileName=None):
	#return static_file(fileName, root='/opt/canopsis/tmp/report', mimetype='application/pdf')

@get('/getReport/:fileName',apply=[check_auth])
def get_report(fileName=None):
	conn=Connection("127.0.0.1", 27017)
	db=conn['canopsis']
	fs = gridfs.GridFS(db, collection='report')

	try:
		#try to find the latest version of the file
		report_file = fs.get_version(filename=fileName, version=-1)
	except Exception, err:
			self.logger.error("Exception !\nReason: %s" % err)
			return HTTPError(404, _id+" Not Found")
	
	if report_file:
		#fix mime-type
		response.content_type = 'application/pdf'
		return report_file
	else:
		return HTTPError(404, fileName+" Not Found")

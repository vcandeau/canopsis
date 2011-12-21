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
from bottle import route, get, request, HTTPError, post, static_file

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
def generate_report(startTime, stopTime,view_name,):
	#build file name	
	name_array = view_name.split('.')
	file_name = name_array[len(name_array)-1]
	file_name += '_' + str(date.fromtimestamp(int(startTime) / 1000)) +'.pdf'
	
	#create path
	file_path = '/opt/canopsis/tmp/' + file_name
	
	#parameters are : javascript delay | javascript script |  file name
	logger.debug('serveur output')
	logger.debug('wkhtml2pdf_wrapper 10000 ' + file_name +' '+view_name+' '+startTime+' '+stopTime)
	
	#launching subprocess
	report_cmd = subprocess.Popen('wkhtml2pdf_wrapper 10000 ' + file_name +' '+view_name+' '+startTime+' '+stopTime, shell=True)
	
	#wait the end of the process
	while(report_cmd.poll() == None):
		gevent.sleep(1)

	
	if os.path.exists(file_path):
		logger.debug('file found, send it')
		return {'total': 1, 'success': True, 'data': { 'url' : '/getReport/' + file_name }}
	else:
		logger.debug('file not found, error while generating pdf')
		return {'total': 0, 'success': False, 'data': {}}
	
	
#@get('/getReport/',apply=[check_auth])
@get('/getReport/:fileName',apply=[check_auth])
def get_report(fileName=None):
	return static_file(fileName, root='/opt/canopsis/tmp/', mimetype='application/pdf')

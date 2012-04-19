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
from bottle import route, get, delete, request, HTTPError, post, static_file, response

from urllib import quote
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
from cfile import cfile

#import protection function
from libexec.auth import check_auth, get_account

logger = logging.getLogger('Reporting')

#########################################################################

@get('/reporting/:startTime/:stopTime/:view_name',apply=[check_auth])
def generate_report(startTime, stopTime,view_name):
	account = get_account()
	storage = cstorage(account=account, namespace='object')
	
	#get crecord name of the view (id is really harsh)
	try:
		record = storage.get(view_name,account=account)
		
		fromDate = str(date.fromtimestamp(int(startTime) / 1000))
		toDate = str(date.fromtimestamp(int(stopTime) / 1000))
		
		file_name = '%s_From_%s_To_%s.pdf' % (record.name,fromDate,toDate)
	except  Exception, err:
		logger.error(err)
		name_array = view_name.split('.')
		file_name = name_array[len(name_array)-1]
		file_name += '_' + str(date.fromtimestamp(int(startTime) / 1000)) +'.pdf'

	fileName = None
	
	try:
		import task_reporting
	except Exception, err:
		logger.debug("Check your celeryconfig.py, if you have reporting task imported")
		logger.debug(err)
	try:
		logger.debug('Run celery task')
		result = task_reporting.render_pdf.delay(file_name,
										view_name,
										startTime,
										stopTime,
										account,
										"/opt/canopsis/etc/wkhtmltopdf_wrapper.json")
		result.wait()
		fileName = result.result
	except Exception, err:
		logger.error(err)

	if fileName:
		return {'total': 1, 'success': True, 'data': { 'url': '/getReport/' + str(fileName)}}
	else:
		logger.debug('file not found, error while generating pdf')
		return {'total': 0, 'success': False, 'data': {}}
	
@get('/getReport/:metaId',apply=[check_auth])
def get_report(metaId=None):
	account = get_account()
	storage = cstorage(account=account, namespace='reports')

	meta = storage.get(metaId)
	meta.__class__ = cfile

	report = meta.get(storage)

	#logger.debug('MetaId  : %s' % metaId)
	#logger.debug('Filename: %s' % report.name)

	if report:
		response.headers['Content-Disposition'] = 'attachment; filename="%s"' % report.name
		response.headers['Content-Type'] = 'application/pdf'
		try:
			return report
		except Exception, err:
			logger.debug(err)
	else:
		logger.error('No report found in gridfs')
		return HTTPError(404, " Not Found")

@post('/report',apply=[check_auth])
def modify_report():
	
	data = json.loads(request.body.readline())
	reportId = None
	file_name = None
	logger.error(data)
	try:
		reportId = data['_id']
		file_name = data['file_name']
	except Exception, err:
		
		logger.error('New report information not found : %s' % err)
	
	if not reportId:
		logger.error('No report Id specified')
		return HTTPError(405, " No report Id specified")
		
	if file_name:
		###########account and storage
		account = get_account()
		storage = cstorage(account=account, namespace='reports')
		try:
			document = storage.get(reportId)
			logger.error(document)
			if document:
				document.data['file_name'] = file_name
				storage.put(document)
		except Exception, err:
			logger.error("Error when updating report %s: %s" % (reportId,err))
			return HTTPError(500, "Failed to update report")

@post('/sendreport',apply=[check_auth])
def send_report():
	data = request.body.readline()
	'''
	reportStorage = cstorage(account=account, namespace='reports')
	meta = reportStorage.get(id)
	meta.__class__ = cfile
	'''
	return {'success':True,'total':'1','data':{'output':'Mail sent'}}
	
	
	

@get('/report',apply=[check_auth])
def get_list_report():
	limit		= int(request.params.get('limit', default=20))
	start		= int(request.params.get('start', default=0))
	filter		= request.params.get('filter', default=None)
	
	###########account and storage
	account = get_account()
	storage = cstorage(account=account, namespace='reports')
	
	###########load filter
	if filter:
		try:
			filter = json.loads(filter)
		except Exception, err:
			logger.error("Filter decode: %s" % err)
			filter = None
			
	if isinstance(filter, list):
		if len(filter) > 0:
			filter = filter[0]
		else:
			logger.error(" + Invalid filter format")
			filter = {}
	
	###########search
	records = storage.find(filter, limit=limit, offset=start,account=account)
	total = storage.count(filter, account=account)
	
	data = []
	
	for record in records:
		dump = record.dump(json=True)
		#cleaning non serializable
		del dump['data_id']
		data.append(dump)
		
	return {'total': total, 'success': True, 'data': data}

@delete('/report/:metaId',apply=[check_auth])
def delete_report(metaId=None):
	account = get_account()
	storage = cstorage(account=account, namespace='reports')
	
	if metaId:
		try :
			storage.remove(metaId,account=account)
		except:
			logger.error('Failed to remove report')
			return HTTPError(500, "Failed to remove report")
		
	else:
		logger.error('No report Id specified')
		return HTTPError(404, " No report Id specified")

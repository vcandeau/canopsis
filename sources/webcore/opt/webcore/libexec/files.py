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

import sys, os, logging, json
import gevent

import bottle
from bottle import route, get, delete, request, HTTPError, post, static_file, response

#gridfs
from pymongo import Connection
import gridfs

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord
from cfile import cfile

#import protection function
from libexec.auth import check_auth, get_account

logger = logging.getLogger('Files')
namespace = "files"

#########################################################################

@get('/files/:metaId',apply=[check_auth])
@get('/files',apply=[check_auth])
def files(metaId=None):
	
	if metaId:
		account = get_account()
		storage = cstorage(account=account, namespace=namespace)
	
		logger.debug("Get file '%s'" % metaId)
		meta = storage.get(metaId)
		meta.__class__ = cfile
		
		file_name = meta.data['file_name']
		content_type = meta.data['content_type']
		
		logger.debug(" + File name: %s" % file_name)
		logger.debug(" + Content type: %s" % content_type)
		
		report = meta.get(storage)

		if report:
			response.headers['Content-Disposition'] = 'attachment; filename="%s"' % file_name
			response.headers['Content-Type'] = content_type
			try:
				return report
			except Exception, err:
				logger.error(err)
		else:
			logger.error('No report found in gridfs')
			return HTTPError(404, " Not Found")
	else:
		return list_files()

@post('/files',apply=[check_auth])
def update_file():
	
	data = json.loads(request.body.readline())
	metaId = None
	file_name = None
	
	logger.debug("Update file")
	
	try:
		metaId = data['_id']
		file_name = data['file_name']
	except Exception, err:
		logger.error('Not enough arguments: %s' % err)
		return HTTPError(404, "Not enough arguments")
		

	logger.debug(" + metaId: %s" % metaId)
	logger.debug(" + file name: %s" % file_name)
	
	if not metaId:
		logger.error('No report Id specified')
		return HTTPError(405, " No report Id specified")
		
	if file_name:
		###########account and storage
		account = get_account()
		storage = cstorage(account=account, namespace=namespace)
		try:
			document = storage.get(metaId)
			if document:
				document.data['file_name'] = file_name
				document.name = file_name
				storage.put(document)
				
		except Exception, err:
			logger.error("Error when updating report %s: %s" % (metaId,err))
			return HTTPError(500, "Failed to update report")


@delete('/files/:metaId',apply=[check_auth])
def delete_file(metaId):
	account = get_account()
	storage = cstorage(account=account, namespace=namespace)
	
	try :
		storage.remove(metaId,account=account)
	except:
		logger.error('Failed to remove report')
		return HTTPError(500, "Failed to remove report")
		
		
def list_files():
	limit		= int(request.params.get('limit', default=20))
	start		= int(request.params.get('start', default=0))
	sort		= request.params.get('sort', default=None)
	filter		= request.params.get('filter', default=None)
	
	###########account and storage
	account = get_account()
	storage = cstorage(account=account, namespace=namespace)

	logger.debug("List files")
		
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
	
	msort = []
	if sort:
		sort = json.loads(sort)
		for item in sort:
			direction = 1
			if str(item['direction']) == "DESC":
				direction = -1

			msort.append((str(item['property']), direction))
	
	
	###########search
	try:
		records = storage.find(filter, sort=msort,limit=limit, offset=start,account=account)
		total = storage.count(filter, account=account)
	except Exception,err:
		logger.error('Error while fetching records : %s' % err)
	
	data = []
	
	for record in records:
		dump = record.dump(json=True)
		#cleaning non serializable
		del dump['data_id']
		data.append(dump)
		
	return {'total': total, 'success': True, 'data': data}

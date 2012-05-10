#!/usr/bin/env python
#--------------------------------
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

from caccount import caccount
from cstorage import get_storage
from crecord import crecord

logger = None

##set root account
root = caccount(user="root", group="root")

def init():
	storage = get_storage(account=root, namespace='object')
	
	groups =  ['root', 'canopsis', 'curves_admin']
	
	# (0'login', 1'pass', 2'group', 3'lastname', 4'firstname', 5'email')
	accounts = [
		('root','root', 'root', 'Lastname', 'Firstname', ''),
		('canopsis','canopsis', 'root', 'Psis', 'Cano', '')
	]

	for name in groups:
		try:
			# Check if exist
			record = storage.get('group.%s' % name)
		except:
			logger.info(" + Create group '%s'" % name)
			record = crecord({'_id': 'group.%s' % name }, type='group', name=name)
			record.chmod('o+r')
			storage.put(record)
		
	for account in accounts:
		user = account[0]
		try:
			# Check if exist
			record = storage.get('account.%s' % user)
		except:
			logger.info(" + Create account '%s'" % user)
			
			record = caccount(user=user, group=account[2])
			record.firstname = account[4]
			record.lastname = account[3]
			record.passwd(account[1])
			storage.put(record)
		

	###Root directory
	try:
		# Check if exist
		rootdir = storage.get('directory.root')
	except:
		logger.info(" + Create root directory")
		rootdir = crecord({'_id': 'directory.root','id': 'directory.root','expanded':'true'},type='view_directory', name="root directory")
		rootdir.chmod('o+r')
		storage.put(rootdir)
	
	records = storage.find({'crecord_type': 'account'}, namespace='object', account=root)
	for record in records:
		user = record.data['user']
		
		try:
			# Check if exist
			record = storage.get('directory.root.%s' % user)
		except:
			logger.info(" + Create '%s' directory" % user)
			userdir = crecord({'_id': 'directory.root.%s' % user,'id': 'directory.root.%s' % user ,'expanded':'true'}, type='view_directory', name=user)
			userdir.chown(user)
			userdir.chgrp(user)
			userdir.chmod('g-w')
			userdir.chmod('g-r')

			storage.put(userdir)
			rootdir.add_children(userdir)

			storage.put(rootdir)
			storage.put(userdir)


def update():
	init()

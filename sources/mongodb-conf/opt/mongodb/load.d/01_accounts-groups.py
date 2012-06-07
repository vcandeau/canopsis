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
from cgroup import cgroup

logger = None

##set root account
root = caccount(user="root", group="root")

def init():
	storage = get_storage(account=root, namespace='object')
	
	groups =  ['root', 'canopsis', 'curves_admin','view_managing','exporting','reporting','account_managing']
	
	# (0'login', 1'pass', 2'group', 3'lastname', 4'firstname', 5'email')
	accounts = [
		('root','root', 'root', 'Lastname', 'Firstname', ''),
		('canopsis','canopsis', 'canopsis', 'Psis', 'Cano', '')
	]

	for name in groups:
		try:
			# Check if exist
			record = storage.get('group.%s' % name)
		except:
			logger.info(" + Create group '%s'" % name)
			record = crecord({'_id': 'group.%s' % name }, type='group', name=name, group='group.account_managing')
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
			record.chown(record._id)
			record.chgrp(record.group)
			record.chmod('g+r')
			record.passwd(account[1])
			record.generate_new_authkey()
			print(record.dump())
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
			userdir.chown('account.%s' % user)
			userdir.chgrp('group.%s' % user)
			userdir.chmod('g-w')
			userdir.chmod('g-r')

			storage.put(userdir)
			rootdir.add_children(userdir)

			storage.put(rootdir)
			storage.put(userdir)


def update():
	init()
	check_and_create_authkey()
	update_for_new_rights()
	
def check_and_create_authkey():
	storage = get_storage(account=root, namespace='object')
	records = storage.find({'crecord_type': 'account'}, namespace='object', account=root)
	for record in records:
		if 'authkey' in record.data:
			if record.data['authkey'] == None:
				record.generate_new_authkey()
		else:
			record.generate_new_authkey()

def update_for_new_rights():
	#Enable rights , update old record
	storage = get_storage(account=root, namespace='object')

	dump = storage.find({})

	for record in dump:
		if record.owner.find('account.') == -1:
			record.owner = 'account.%s' % record.owner
		if record.group.find('group.') == -1:
			record.group = 'group.%s' % record.group
		#for caccount
		if 'groups' in record.data:
			for group in record.data['groups']:
				if group.find('group.') == -1:
					group = 'group.%s' % group
		#for cgroup
		if 'account_ids' in record.data:
			for account in record.data['account_ids']:
				if account.find('account.') == -1:
					account = 'account.%s' % account
	
	storage.put(dump)
	
	#-------------add new groups and update each record type---------------
	#update view
	try:
		# Check if exist
		group_view_creation = storage.get('group.view_managing')
	except:
		group_view_creation = cgroup(name='view_managing',group='group.account_managing')
		dump = storage.find({'$or': [{'crecord_type':'view'},{'crecord_type':'view_directory'}]})
		for record in dump:
			record.chgrp(group_view_creation._id)
			record.chmod('g+w')
			record.chmod('g+r')
		storage.put(dump, account=root)
	
	#update groups
	try:
		# Check if exist
		group_export = storage.get('group.exporting')
	except:
		group_export = cgroup(name='exporting',group='group.account_managing')
		dump = storage.find({'crecord_type':'schedule'})
		for record in dump:
			record.chgrp(group_export._id)
			record.chmod('g+w')
			record.chmod('g+r')
		storage.put(dump)
	
	#updtade reporting
	try:
		# Check if exist
		group_reporting = storage.get('group.reporting')
	except:
		group_reporting = cgroup(name='reporting',group='group.account_managing')
	
	#update accounts
	try:
		# Check if exist
		group_account_managing = storage.get('group.reporting')
	except:
		group_account_managing = cgroup(name='account_managing',group='group.account_managing')
		dump = storage.find({'$or': [{'crecord_type':'account'},{'crecord_type':'group'}]})
		for record in dump:
			record.chgrp(group_account_managing._id)
			record.chmod('g+w')
			record.chmod('g+r')
		storage.put(dump)
	
	storage.put([group_view_creation,group_export,group_reporting])

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
import bottle, logging, hashlib, json
from bottle import route, get, request, post, HTTPError, redirect

from beaker.middleware import SessionMiddleware

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord

logger = logging.getLogger("auth")

#session variable
session_accounts = {}

#########################################################################

@get('/auth/:login/:password')
@get('/auth/:login')
@get('/auth')
def auth(login=None, password=None):
	if not login:
		login = request.params.get('login', default=None)

	shadow = request.params.get('shadow', default=False)
	if shadow:
		shadow = True
		
	authkey = request.params.get('authkey', default=False)
	if authkey:
		authkey = True

	if not password:
		password = request.params.get('password', default=None)

	if not login or not password:
		return HTTPError(404, "Invalid arguments")

	_id = "account." + login

	logger.debug(" + _id: "+_id)
	logger.debug(" + Login: "+login)
	logger.debug(" + Password: "+password)
	logger.debug("    + is Shadow: "+str(shadow))
	logger.debug("    + is Authkey: "+str(authkey))

	storage = get_storage(namespace='object')

	try:
		account = caccount(storage.get(_id, caccount(user=login)))
		logger.debug(" + Check password ...")

		if shadow:
			access = account.check_shadowpasswd(password)
			
		elif authkey:
			logger.debug(" + Valid auth key: %s" % (account.make_authkey()))
			access = account.check_authkey(password)
			
		else:
			access = account.check_passwd(password)

		if access:
			s = bottle.request.environ.get('beaker.session')
			s['account_id'] = _id
			s['account_user'] = login
			s['auth_on'] = True
			s.save()

			output = [ account.dump() ]
			output = {'total': len(output), 'success': True, 'data': output}
			return output
		else:
			logger.debug(" + Invalid password ...")
	except Exception, err:
		logger.error(err)
		
	return HTTPError(403, "Forbidden")

#Access for disconnect and clean session
@get('/logout')
@get('/disconnect')
def disconnect():
	logger.error("Disconnect")
	s = bottle.request.environ.get('beaker.session')
	s.delete()
	return {'total': 0, 'success': True, 'data': []}


#decorator in order to protect request
def check_auth(callback):
	def do_auth(*args, **kawrgs):
		try:
			path = kawrgs['path']
		except:
			path = None
	
		url = bottle.request.url
		#get beaker session and test it right after
		s = bottle.request.environ.get('beaker.session')
		#add caccount to parameters
		if s.get('auth_on',False) or path == "canopsis/auth.html":
			logger.debug("Session is Ok.")
			return callback(*args, **kawrgs)

		logger.error("Invalid auth")
		return {'total': 0, 'success': False, 'data': []}
		#return redirect('/static/canopsis/auth.html' + '?url=' + url)

	return do_auth

#find the account in memory, or try to find it from database, if not in db log anon
def get_account(_id=None):
	logger.debug("Get Account:")
	if not _id:
		s = bottle.request.environ.get('beaker.session')
		_id = s.get('account_id',0)
		logger.debug(" + Get _id from Beaker Session (%s)" % _id)

	user = s.get('account_user',0)

	logger.debug(" + Try to load account %s ('%s') ..." % (user, _id))

	storage = get_storage(namespace='object')

	try:
		account = session_accounts[_id]
		logger.debug(" + Load account from memory.")
	except:
		if _id:
			record = storage.get(_id, account=caccount(user=user) )
			logger.debug(" + Load account from DB.")
			account = caccount(record)
			session_accounts[_id] = account
		else:
			logger.debug(" + Impossible to load account, return Anonymous account.")
			try:
				return session_accounts['anonymous']
			except:
				session_accounts['anonymous'] = caccount()
				return session_accounts['anonymous']

	return account

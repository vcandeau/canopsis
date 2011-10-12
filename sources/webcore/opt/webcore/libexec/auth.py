#!/usr/bin/env pythonimport sys, os, logging, json

import ConfigParser

import bottle, logging, hashlib, json
from bottle import route, get, request, post, HTTPError, redirect

from beaker.middleware import SessionMiddleware

## Canopsis
from caccount import caccount
from cstorage import cstorage
from cstorage import get_storage
from crecord import crecord

debug = True

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
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

	if not password:
		password = request.params.get('password', default=None)

	if not login or not password:
		return HTTPError(404, "Invalid arguments")

	_id = "account." + login

	logger.debug(" + _id: "+_id)
	logger.debug(" + Login: "+login)
	logger.debug(" + Password: "+password)
	logger.debug(" + Shadow: "+str(shadow))

	storage = get_storage(namespace='object')

	try:
		account = caccount(storage.get(_id, caccount(user=login)))
		logger.debug(" + Check shadow password ...")

		if shadow:
			access = account.check_shadowpasswd(password)
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
	except:
		pass
		
	return HTTPError(403, "Forbidden")

#Access for disconnect and clean session
@get('/logout')
@get('/disconnect')
def disconnect():
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
			return callback(*args, **kawrgs)

		return {'total': 0, 'success': False, 'data': []}
		#return redirect('/static/canopsis/auth.html' + '?url=' + url)

	return do_auth
				

@get('/secure', apply=[check_auth])
def secure():
	account = get_account()
	return "i'm secured test2 (%s) , you can <a href='/disconnect'>disconnect</a>" % account.user


#debug in order to see who is online
@get('/online', apply=[check_auth])
def online():
	output = ""
	for i in session_accounts:
		output += "session name : " + i + "</br>"
	return output

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

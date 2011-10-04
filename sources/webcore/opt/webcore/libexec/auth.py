#!/usr/bin/env pythonimport sys, os, logging, json

import ConfigParser

import bottle, logging, hashlib
from bottle import route, get, request, post, HTTPError

## Canopsis
from caccount import caccount
from cstorage import cstorage
from crecord import crecord

## Initialisation

account = caccount(user="root", group="root")
storage = cstorage(account, namespace="object", logging_level=logging.INFO)

account.passwd("root")
storage.put(account)

debug = False

## Logger
if debug:
	logging_level=logging.DEBUG
else:
	logging_level=logging.ERROR
logging.basicConfig(level=logging_level,
		format='%(asctime)s %(name)s %(levelname)s %(message)s',
)
logger = logging.getLogger("auth")

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

	_id = "account-" + login

	logger.debug(" + _id: "+_id)
	logger.debug(" + Login: "+login)
	logger.debug(" + Password: "+password)
	logger.debug(" + Shadow: "+str(shadow))

	try:
		account = caccount(storage.get(_id))
		logger.debug(" + Check shadow password ...")

		if shadow:
			access = account.check_shadowpasswd(password)
		else:
			access = account.check_passwd(password)

		if access:
			output = [ account.dump() ]
			output = {'total': len(output), 'success': True, 'data': output}
			return output
		else:
			logger.debug(" + Invalid password ...")
	except:
		pass
		
	return HTTPError(403, "Forbidden")



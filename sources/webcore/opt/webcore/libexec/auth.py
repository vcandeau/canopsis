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

#### logging form
@get('/auth/login/:name/:password')
@get('/auth/login/:name')
@get('/auth/login')
def auth_form(name=None,password=None):
	return '''<form method="POST">
                <input name="name"     type="text" />
                <input name="password" type="password" />
                <input type="submit" value="Envoyer">
              </from>'''
              
### posting form
@post('/auth/login')
def auth_log():
	name = request.forms.get('name')
	password = request.forms.get('password')
	
	logger.debug("name = " + name)
	logger.debug("password = " + password)
	
	result = auth_check_account(name,password)
	
	#logger.debug(account)
	
	account = caccount(result)

	
	###########temporary auto hash password##############
	password = hashlib.sha1(repr(password)).hexdigest()
	#####################################################
	
	if account  and account.check_passwd(password):
		return "<p>login will work (when included)<p>"
	else:
		return "<p>unknown user<p>"

	

### check account , return the account or None
def auth_check_account(name, password):
	namespace = "object"
	#names are added with a tag in mongodb
	name_search = "account-" + name
	
	try:
		account = storage.get(name_search,namespace=namespace)
	except:
		account = None
		
	#logger.debug(account)
	
	if account != None:
		return account
	else:
		return None
			

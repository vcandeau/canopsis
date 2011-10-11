#!/usr/bin/env python

import sys, os, logging, json
import ConfigParser

import bottle
from bottle import route, get, put, delete, request, HTTPError

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
logger = logging.getLogger("ui-view")

#########################################################################

#### GET
@get('/ui/view')
def get_all_menu():
	return



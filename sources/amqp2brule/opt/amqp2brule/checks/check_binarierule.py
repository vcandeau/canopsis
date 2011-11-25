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

import logging

STATE = ['OK', 'WARNING', 'CRITICAL']

OP = ['and', 'or']

ENV = {}
LOGGER = None

### Checks

def my_check_id_state(_id, arg, env=None):
	if not env:
		env = ENV

	arg = int(arg)
	try:
		if env[_id]['state'] == arg:
			return True
	except:
		pass

	return False
		
###

def parse_key(key, arg, env=None):
	if not env:
		env = ENV

	if LOGGER:
		LOGGER.debug("   + Key: %s, arg: %s" % (key, arg))

	array = key.split('|')
	check_type = array[0]

	if check_type == 'id':
		check_field = array[1]
		_id = array[2]

		# {'id|state|<_id>: <state>}
		if check_field == 'state':
			return my_check_id_state(_id, arg, env)

#####################

def bloc_and(rules):
	LOGGER.debug(" + AND")
	state = True
	for rule in rules:
		state &= parse_rule(rule)
		
	return state

def bloc_or(rules):
	LOGGER.debug(" + OR")
	state = False
	for rule in rules:
		state |= parse_rule(rule)

	return state	

def parse_rule(rule):
	# One key ...
	state = True
	for key in rule.keys():
		if key in OP:
			if   key == 'and':
				state = bloc_and(rule[key])
			elif key ==  'or':
				state = bloc_or(rule[key])
		else:
			state = parse_key(key, rule[key])

	return state

#rule = { 'and' : [
#		{'id|state|id3': 0 },
#		{'id|state|id2': 1},
#		{'or': [
#			{'id|state|id1': 0},
#			{'id|state|id3': 2}
#		]}
#	]}



########################

def check_binarierule(logger, env, ok_rule={}, warn_rule={}, crit_rule={}):
	global ENV, LOGGER
	ENV = env
	LOGGER = logger

	state = 0

	if ok_rule:
		logger.debug("Check Ok rule ...")
		if parse_rule(ok_rule):
			state = 0
		else:
			state = 2

	if warn_rule:
		logger.debug("Check Warning rule ...")
		if parse_rule(warn_rule):
			state = 1

	if crit_rule:
		logger.debug("Check Critical rule ...")
		if parse_rule(crit_rule):
			state = 2

	logger.debug("Result: %s" % STATE[state])

	return state



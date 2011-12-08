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

import time, os, sys, logging, json

from ctools import dynmodloads
import cevent

from cselector import cselector

from txamqp.content import Content

STATE = ['OK', 'WARNING', 'CRITICAL']

ALL_CHECKS = None
ALL_ACTIONS = None

class cbrule(cselector):
	def __init__(self, autoinit=True, amqp=None, *args, **kargs):
		## Default vars
		self.hardonly = True
		self.raw_checks = []
		self.raw_actions = []
		self.fired_state = 0
		self.amqp = amqp

		## Init
		cselector.__init__(self, type='brule', *args, **kargs)

		if autoinit:
			self.init()

	def init(self):
		self.init_env()
		self.init_actions()
		self.init_checks()		

	def dump(self):
		self.data['hardonly'] = self.hardonly
		self.data['raw_checks'] = self.raw_checks
		self.data['raw_actions'] = self.raw_actions
		self.data['fired_state'] = self.fired_state
		return cselector.dump(self)

	def load(self, dump):
		cselector.load(self, dump)
		self.hardonly = self.data['hardonly']
		self.raw_checks = self.data['raw_checks']
		self.raw_actions = self.data['raw_actions']
		self.fired_state = self.data['fired_state']

	def init_checks(self, doCheck=True):
		self.logger.debug("Init checks ...")
		global ALL_CHECKS
		if not ALL_CHECKS:
			ALL_CHECKS = dynmodloads("~/opt/amqp2brule/checks", True, '^check_')

		self.checks = []
		for raw_check in self.raw_checks:
			check = raw_check.copy()
			name = check['fn']
			try:
				self.logger.debug(" + Add '%s'" % name)
				check['fn'] = ALL_CHECKS[check['fn']]
				check['args'] = json.loads(check['args'])
				self.checks.append(check)
				self.logger.debug("   + Success")
			except Exception, err:
				self.logger.error("   + Impossible to load '%s' (%s)" % (name, err))

		if self.checks and doCheck:
			self.check()

	def init_actions(self):
		self.logger.debug("Init action ...")
		global ALL_ACTIONS
		if not ALL_ACTIONS:
			ALL_ACTIONS = dynmodloads("~/opt/amqp2brule/actions", True, '^action_')
		
		self.actions = []
		for raw_action in self.raw_actions:
			action = raw_action.copy()
			name = action['fn']
			try:
				self.logger.debug(" + Add '%s'" % name)
				action['fn'] = ALL_ACTIONS[action['fn']]
				check['args'] = json.loads(action['args'])
				self.actions.append(action)
				self.logger.debug("   + Success")
			except Exception, err:
				self.logger.error("   + Impossible to load '%s' (%s)" % (name, err))

	def init_selector(self):
		self.logger.debug("Get ids from selector '%s' ..." % self.selector_id)

		self.selector = cselector(_id=self.selector_id, storage=STORAGE)

		self.selector.resolv()
		self.ids = self.selector._ids

	def init_env(self):
		self.logger.debug("Init rule's Env ...")
		
		records = self.resolv()
		self.env = {}
		for record in records:
			self.env[record._id] = record.dump()
			self.logger.debug(" + Success for '%s'" % record._id)

	def add_check(self, fn, args={}, doCheck=False):
		self.raw_checks.append({'fn': fn, 'args': json.dumps(args)})
		self.init_checks(doCheck)

	def add_action(self, fn, args={}):
		self.raw_actions.append({'fn': fn, 'args': json.dumps(args)})
		self.init_actions()

	def push_event(self, _id, event):
		if self.match(_id):
			self.logger.debug(" + Push "+_id)
			if self.hardonly:
				try:
					#self.logger.debug("   + Check Type: %s " % event['check_type'])
					if int(event['check_type']) == 0:
						self.env[_id] = event	
						self.check()
					else:
						self.logger.debug(" + Not hard state ...")
				except:
						self.env[_id] = event	
						self.check()
			else:
				self.env[_id] = event
				self.check()

	def check(self):
		self.logger.debug("Check ...")
		state = 0
		for check in self.checks:
			try:
				self.logger.debug(" + '%s' ..." % check['fn'].__name__)
				check_state = check['fn'](self.logger, self.env, **check['args'])
				self.logger.debug("   + %s" % STATE[check_state])
			except Exception, err:
				check_state = 0
				self.logger.error("   + Exception in '%s' (%s)" % (check['fn'].__name__, err))

			if check_state > state:
				state = check_state

		if self.fired_state != state:
			self.fired_state = state
			self.fire(state)



	def fire(self, state):
		self.logger.debug("fire %s !!!" % STATE[state])
		message = "Rule '%s' fire with state %s ..." % (self.name, STATE[state])
		for action in self.actions:
			try:
				self.logger.debug(" + '%s' ..." % action['fn'].__name__)
				action['fn'](self.logger, self.env, state, **check['args'])
			except Exception, err:
				self.logger.error("   + Exception in '%s' (%s)" % (check['fn'].__name__, err))


		if self.amqp:
			event = cevent.forger(connector='brule', connector_name='canopsis', event_type='brule', state=state, output=message )
			rk = cevent.get_routingkey(event)
			
			msg = Content(json.dumps(event))
			self.logger.debug(" + Publish with RK '%s' ..." % event['rk'])
			self.amqp.publish(msg, rk, self.amqp.exchange_name_events)
			self.save()


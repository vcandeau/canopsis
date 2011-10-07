#!/usr/bin/env python

import time, os, sys, logging

from ctools import dynmodloads

from cstorage import cstorage
from crecord import crecord
from caccount import caccount
from cselector import cselector

STATE = ['OK', 'WARNING', 'CRITICAL']

ALL_CHECKS = dynmodloads("/home/wpain/Bureau/hypervision/sources/rulesd/opt/rulesd/checks", True, '^check_')
ALL_ACTIONS = dynmodloads("/home/wpain/Bureau/hypervision/sources/rulesd/opt/rulesd/checks", True, '^action_')

STORAGE = cstorage(caccount(user="root", group="root"), namespace='inventory', logging_level=logging.DEBUG)

class cbrule(object):
	def __init__(self, name, selector=None, ids=None, logging_level=logging.DEBUG, amqp=None):

		logging_level=logging.DEBUG
		self.logger = logging.getLogger('cbrules.'+name)
		self.logger.setLevel(logging_level)

		self.name = name
		self.amqp = amqp

		self.hardonly = True
		self.raw_checks = []
		#	{'fn': 'check_state_more', 'args': {'state': 2, 'twarn': 1, 'tcrit': 2} },
		#	{'fn': 'check_state', 'args': {} }
		#]

		self.raw_actions = []
		#	{'fn': 'check_state_more', 'args': {'state': 2, 'twarn': 1, 'tcrit': 2} }
		#]

		try:
			self.config = STORAGE.get('brule-'+name)
			ids = self.config.data['ids']
			selector = self.config.data['selector']
			self.hardonly = self.config.data['hardonly']
			self.raw_checks = self.config.data['raw_checks']
			self.raw_actions = self.config.data['raw_actions']
			
		except:
			self.config = None


		if ids:
			self.ids = ids
		else:
			self.selector_id = selector
			self.init_selector()

		self.fired_state = 0

		self.init_env()
		self.init_checks()
		self.init_actions()

	def save(self):
		self.logger.debug("Save Bussiness Rule ...")
		if not self.config:
			self.logger.debug(" + Create record ...")
			ids = self.ids
			if self.selector_id:
				ids = None

			self.config = crecord(	data={'raw_checks': self.raw_checks, 'raw_actions': self.raw_actions, 'hardonly': self.hardonly, 'ids': ids, 'selector': self.selector_id},
						name='brule-'+name,
						type='brule',
					)

		STORAGE.put(self.config)

	def init_checks(self, doCheck=True):
		self.logger.debug("Init checks ...")
		
		self.checks = []
		for raw_check in self.raw_checks:
			check = raw_check.copy()
			name = check['fn']
			try:
				self.logger.debug(" + Add '%s'" % name)
				check['fn'] = ALL_CHECKS[check['fn']]
				self.checks.append(check)
				self.logger.debug("   + Success")
			except Exception, err:
				self.logger.error("   + Impossible to load '%s' (%s)" % (name, err))

		if self.checks:
			self.check()

	def init_actions(self):
		self.logger.debug("Init action ...")
		
		self.actions = []
		for raw_action in self.raw_actions:
			action = raw_action.copy()
			name = action['fn']
			try:
				self.logger.debug(" + Add '%s'" % name)
				action['fn'] = ALL_ACTIONS[action['fn']]
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
		self.env = {}
		for _id in self.ids:
			try:
				record = STORAGE.get(_id)
				self.env[_id] = record.dump()
				self.logger.debug(" + Success for '%s'" % _id)
			except:
				self.logger.error(" + Id '%s' not found in inventory ..." % _id)
				del(self.ids[self.ids.index(_id)])

	def add_check(self, fn, args={}):
		self.raw_checks.append({'fn': fn, 'args': args})
		self.init_checks()

	def add_action(self, fn, args={}):
		self.raw_actions.append({'fn': fn, 'args': args})
		self.init_actions()

	def push_event(self, _id, event):
		if len(self.ids) == 0:
			return

		if _id in self.ids:
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
				self.logger.error("   + Exception in '%s' (%s)" % (check['fn'].__name__, err))

			if check_state > state:
				state = check_state

		if self.fired_state != state:
			self.fired_state = state
			self.fire(state)



	def fire(self, state):
		self.logger.debug("fire %s !!!" % STATE[state])
		for action in self.actions:
			try:
				self.logger.debug(" + '%s' ..." % action['fn'].__name__)
				action['fn'](self.logger, state, **check['args'])
			except Exception, err:
				self.logger.error("   + Exception in '%s' (%s)" % (check['fn'].__name__, err))


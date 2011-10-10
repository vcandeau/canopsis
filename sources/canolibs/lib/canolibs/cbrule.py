#!/usr/bin/env python

import time, os, sys, logging, json

from ctools import dynmodloads
from ctools import make_event

from cstorage import cstorage
from crecord import crecord
from caccount import caccount
from cselector import cselector

from txamqp.content import Content

STATE = ['OK', 'WARNING', 'CRITICAL']

ALL_CHECKS = None
ALL_ACTIONS = None

class cbrule(cselector):
	def __init__(self, name=None, _id=None, storage=None, namespace='inventory', record=None, autoinit=True, mids=None, mfilter=None, amqp=None, logging_level=logging.DEBUG):

		if not storage:
			self.storage = cstorage(caccount(user="root", group="root"), namespace='object', logging_level=logging.INFO)
		else:
			self.storage = storage

		if not name:
			raise Exception('You must specify name or record ...')

		self.hardonly = True
		self.raw_checks = []
		self.raw_actions = []
		self.fired_state = 0
		self.amqp = amqp

		self._id = 'brule.'+self.storage.account.user+'.'+name

		cselector.__init__(self, storage=self.storage, _id=self._id, logging_level=logging_level, namespace=namespace)

		if mids:
			self.mids = mids
		if mfilter:
			self.mfilter = mfilter

		self.name = name
		self.type = 'brule'

		logging_level=logging.DEBUG
		self.logger = logging.getLogger('cbrules.'+self.name)
		self.logger.setLevel(logging_level)

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
			event = make_event(service_description=self.name, source_name='amqp2brule', source_type=self.type, host_name=self.storage.account.user, state_type=1, state=state, output=message)
			msg = Content(json.dumps(event))
			self.logger.debug(" + Publish with RK '%s' ..." % event['rk'])
			self.amqp.publish(msg, event['rk'], self.amqp.exchange_name_liveevents)
			self.save()


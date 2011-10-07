#!/usr/bin/env python

STATE = ['OK', 'WARNING', 'CRITICAL']

		
def check_state(logger, env):
	state = 0
	ids = []
	for key in env.keys():
		#if env[key]['state'] == state:
			#ids.append(key)			

		if env[key]['state'] > state:
			state = env[key]['state']
			#ids = [ key ]

	#logger.debug(" + %s for %s" % (STATE[state], ids))

	return state



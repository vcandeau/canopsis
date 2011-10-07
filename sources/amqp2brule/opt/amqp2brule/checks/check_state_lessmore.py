#!/usr/bin/env python

STATE = ['OK', 'WARNING', 'CRITICAL']

def get_state_total(env, state):
	#print " + Get total of state " + STATE[state]
	nb = 0
	for key in env.keys():
		#print "   + Parse " + key
		if env[key]['state'] == state:
			nb += 1
	#print "   + "+ str(nb)
	return nb
	

def check_state_more(logger, env, state=2, twarn=None, tcrit=1):
	nb = get_state_total(env, state)
	
	if not twarn:
		twarn = tcrit

	logger.debug(" + %s %s in env" % (nb, STATE[state]))
	logger.debug("  + WARNING:\tif %s >= %s" % (nb, twarn))
	logger.debug("  + CRITICAL:\tif %s >= %s" % (nb, tcrit))

	result = 0
	if nb >= twarn:
		result = 1
	if nb >= tcrit:
		result = 2

	logger.debug("   -> %s " % STATE[result])
	return result

		
def check_state_less(logger, env, state=2, twarn=None, tcrit=1):
	nb = get_state_total(env, state)

	if not twarn:
		twarn = tcrit
	
	logger.debug(" + %s %s in env" % (nb, STATE[state]))
	logger.debug("  + CRITICAL:\tif %s <= %s" % (nb, tcrit))
	logger.debug("  + WARNING:\tif %s <= %s" % (nb, twarn))

	result = 0
	if nb <= twarn:
		result = 1

	if nb <= tcrit:
		result = 2

	logger.debug("   -> %s " % STATE[result])
	return result



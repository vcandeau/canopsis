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



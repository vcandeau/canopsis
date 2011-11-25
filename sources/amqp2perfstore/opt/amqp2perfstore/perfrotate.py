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
import time

from cstorage import cstorage
from cperfstore import cperfstore
from caccount import caccount

from ctimer import ctimer

if __name__ == "__main__":
	storage = cstorage(caccount(user="root", group="root"), namespace='perfdata')

	timer = ctimer(logging_level=logging.DEBUG)

	perfstore = cperfstore(storage=storage,logging_level=logging.DEBUG)

	timer.start()
	perfstore.rotate()
	timer.stop()	
	

	



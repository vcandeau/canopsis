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
import os, logging
from subprocess import Popen

def load_conf(filename, viewname, starttime, stoptime, wrapper_conf_file):
	import json
	conf = open(wrapper_conf_file, "r").read()
	settings = json.loads(conf)
	settings['filename'] = filename
	settings['viewname'] = viewname
	settings['starttime'] = starttime
	settings['stoptime'] = stoptime
	return settings 

def check_xorg(lock, xvfb_cmd):
	if os.path.isfile(lock):
		logger.debug(" [WK_WRAPPER] :: X server already started (if not, delete %s)" % lock)
	else:
		logger.debug(" [WK_WRAPPER] :: X server not already started")
		output = Popen(xvfb_cmd, shell=True)

def export_env(interface):
	logger.debug(" [WK_WRAPPER] :: Set env DISPLAY to %s" % interface)
	os.environ['DISPLAY'] = interface

def check_report_dir(report_dir):
	logger.debug(" [WK_WRAPPER] :: Check if report directorie exist")
	if not os.path.isdir(report_dir):
		logger.debug(" [WK_WRAPPER] :: Create it at %s" % report_dir)
		os.makedirs(report_dir)

def	get_cookie(cookiejar):
	logger.debug(" [WK_WRAPPER] :: Recreate cookie (%s)" % cookiejar)
	logger.debug("wkhtmltopdf --load-error-handling ignore --cookie-jar %s \"http://127.0.0.1:8082/auth/root/root\" /dev/null" % cookiejar)
	output = Popen("wkhtmltopdf --load-error-handling ignore --cookie-jar %s \"http://127.0.0.1:8082/auth/root/root\" /dev/null" % cookiejar, shell=True)
	
	if os.path.isfile(cookiejar):
		logger.debug(" [WK_WRAPPER] :: Cookie created")
	
def run(settings):
	global logger
	logger = logging.getLogger('Reporting')
	filename 		= settings['filename']
	viewname 		= settings['viewname']
	starttime 		= settings['starttime']
	stoptime		= settings['stoptime']
	cookiejar		= settings['cookiejar']
	windowstatus	= settings['windowstatus']
	opts			= settings['opts']
	xlock			= settings['xlock']
	xvfb_cmd		= settings['xvfb_cmd']
	display_int		= settings['display_int']
	report_dir		= settings['report_dir']
	header			= settings['header']
	footer			= settings['footer']

	check_xorg(xlock, xvfb_cmd)
	export_env(display_int)
	check_report_dir(report_dir)
	get_cookie(cookiejar)

	runscript = "var export_view_id='%s';var export_from=%s;var export_to=%s" % (viewname, starttime, stoptime)
	opts = ' '.join(opts)

	logger.debug("wkhtmltopdf %s %s %s --window-status %s --cookie-jar %s --run-script \"%s\" 'http://127.0.0.1:8082/static/canopsis/reporting.html' '%s/%s'" % (opts, header, footer, windowstatus, cookiejar, runscript, report_dir, filename))

	return Popen("wkhtmltopdf %s %s %s --window-status %s --cookie-jar %s --run-script \"%s\" 'http://127.0.0.1:8082/static/canopsis/reporting.html' '%s/%s'" % (opts, header, footer, windowstatus, cookiejar, runscript, report_dir, filename), shell=True)

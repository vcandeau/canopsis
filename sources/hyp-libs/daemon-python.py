#!/usr/bin/env python
import os, daemon, lockfile, logging, signal, sys, time
sys.path.append(os.path.expanduser("~/opt/hyp-daemons/"))
daemon_name = os.path.basename(sys.argv[0])

########################################################
#
#   Daemonize
#
########################################################

def usage():
	print "Usage: %s [start|stop|restart|status]" % sys.argv[0]

try:
	action = sys.argv[1]
except:
	usage()
	sys.exit(1)

exec "from %s import main" % daemon_name

def get_pids():
	mypid = os.getpid()
	return [(int(p), c) for p, c in [x.rstrip('\n').split(' ', 1)  for x in os.popen("ps h -eo pid:1,command | grep -v grep | grep '%s' | grep start | grep -v '%i'" % (daemon_name, mypid))]]

def start():
	print "Start Daemon %s" % daemon_name
	# capture stdout/err in logfile
	log_file = os.path.expanduser("~/var/log/"+ daemon_name + ".log")
	pid_file = os.path.expanduser("~/var/run/"+ daemon_name)
	log = open(log_file, 'a+')
	 
	# daemonize
	context = daemon.DaemonContext(
		working_directory=os.path.expanduser("~"),
		umask=0o002,
		#pidfile=lockfile.FileLock(pid_file),
		detach_process=True,
		stdout=log,
		stderr=log
		)
		
	with context:
		main()
		
def stop():
	print "Stop Daemon %s" % daemon_name
	pids = get_pids()
	for pid in pids:
		try:
			print "\t kill process %i ..." % pid[0]
			os.kill(pid[0], signal.SIGTERM)
		except Exception, err:
			print err
	if len(pids) == 0:
		print "\tNo process to kill..."
		
def status():
	pids = get_pids()
	print "Status of %s" % daemon_name
	print "\t %i process run" % len(pids)
	
def restart():
	stop()
	while True:
		if len(get_pids()) == 0:
			break
		time.sleep(1)
	start()
		
if action == "start":
	start()		
elif action == "stop":
	stop()
elif action == "status":
	status()	
elif action == "restart":
	restart()
else:
	usage()
	sys.exit(1)

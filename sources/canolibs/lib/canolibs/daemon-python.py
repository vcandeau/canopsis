#!/usr/bin/env python
import os, daemon, lockfile, logging, signal, sys, time
import ConfigParser

daemon_name = os.path.basename(sys.argv[0])

if daemon_name == "daemon-python.py":
	print "You must use with symbolic link ..."
	sys.exit(1)

pidfile_path = os.path.expanduser("~/var/run/"+daemon_name+".pid")
conf_file = os.path.expanduser("~/etc/daemon.d/"+daemon_name+".conf")

if not os.path.exists(conf_file):
	print "Impossible to find daemon configuration file ..."
	sys.exit(1)

config = ConfigParser.RawConfigParser()
config.read(conf_file)

if not config.getboolean("daemon", "start"):
	print "Set 'start' to true in %s ..." % conf_file
	sys.exit(1)

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

base_path = config.get("daemon", "path")
base_path = os.path.expanduser(base_path)
base_path = os.path.dirname(base_path)
sys.path.append(base_path)

try:
	exec "from %s import main" % daemon_name
except:
	print "Impossible to find deamon code ..."
	sys.exit(1)

def get_pids():
	pids = []
	if os.path.exists(pidfile_path):
		pidfile = open(pidfile_path, 'r')
		try:
			pids = pidfile.read().split('\n')
		except:
			print 'Could not read pidfile %s' % pidfile_path
			raise SystemExit(1)

	return pids

def set_pid():
	pid = str(os.getpid())
	if os.path.exists(pidfile_path):
		pidfile = open(pidfile_path, 'a')
		pidfile.write("\n"+pid)
		pidfile.close()
	else:
		pidfile = open(pidfile_path, 'w')
		pidfile.write(pid)
		pidfile.close()

def start():
	# Check nb daemon
	max_nb_process = config.getint("daemon", "nb_process")
	if len(get_pids()) >= max_nb_process:
		print "Maximum number of processes reached (%s) ..." % max_nb_process
		sys.exit(1)
	
	print "Start Daemon %s" % daemon_name
	# capture stdout/err in logfile
	log_file = os.path.expanduser("~/var/log/"+ daemon_name + ".log")
	pid_file = os.path.expanduser("~/var/run/"+ daemon_name)
	log = open(log_file, 'a+')
	
	if config.getboolean("daemon", "detach_process"):
		stdout=log
		stderr=log
	else:
		stdout=sys.stdout
		stderr=sys.stderr
	
	# daemonize
	context = daemon.DaemonContext(
		working_directory=os.path.expanduser("~"),
		umask=0o002,
		detach_process=config.getboolean("daemon", "detach_process"),
		stdout=stdout,
		stderr=stderr
		)
		
	with context:
		set_pid()
		main()
		
def stop():
	print "Stop Daemon %s" % daemon_name
	pids = get_pids()
	
	if len(pids) == 0:
		print "\tNo process to kill..."
		sys.exit(0)
		
	for pid in pids:
		try:
			print "\tkill process %s ..." % pid
			os.kill(int(pid), signal.SIGTERM)
		except Exception, err:
			print err

	if os.path.exists(pidfile_path):
		os.unlink(pidfile_path)
		
def status():
	pids = get_pids()
	if len(pids) > 0:
		print "Status of %s:" % daemon_name
		for pid in pids:
			print "\t %s is running ..." % pid
	else:
		print daemon_name, "is not running"
	
def restart():
	stop()
	time.sleep(1)
	start()
	
	
########################################################
#
#   Parse action
#
########################################################

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

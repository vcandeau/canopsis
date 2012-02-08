from celery.task import task
from subprocess import Popen
from tempfile import mkdtemp
from time import strftime as date
import logging, os, shutil

@task
def mongo(host='localhost', output='/opt/canopsis/var/backups'):
	logger = logging.getLogger()
	logger.debug('Mongo Backup start')
	logger.debug('Host  : %s' % host)
	logger.debug('Output: %s' % output)

	logger.debug('Create temp dir')
	archive_name = '%s_mongodb' % date('%d-%m-%Y')
	tmp_dir = mkdtemp(prefix='/opt/canopsis/tmp/')
	os.makedirs('%s/%s' % (tmp_dir, archive_name))

	logger.debug('Create output dir if not exists')
	if not os.path.exists(output):
		os.makedirs(output)	


	logger.debug('Launch mongodump')
	mongodump_cmd = '/opt/canopsis/bin/mongodump --host %s --out %s/%s' % (host, tmp_dir, archive_name)
	logger.debug('Command: %s' % mongodump_cmd)
	dump_output = Popen(mongodump_cmd, shell=True)
	dump_output.wait()

	logger.debug('Create archive into %s' % output)

	shutil.make_archive('%s/%s' % (output, archive_name),
						'zip',
						tmp_dir)

	logger.debug('Remove temp dir')
	shutil.rmtree(tmp_dir)
	
	logger.debug('Mongo Backup finished')

@task
def config(output='/opt/canopsis/var/backups'):
	logger = logging.getLogger()
	logger.debug('Config Backup start')
	logger.debug('Output: %s' % output)
	
	logger.debug('Create output dir if not exists')
	if not os.path.exists(output):
		os.makedirs(output)	

	logger.debug('Create temp dir')
	archive_name = '%s_config' % date('%d-%m-%Y')
	tmp_dir = mkdtemp(prefix='/opt/canopsis/tmp/')

	logger.debug('Copy config files into tmp folder')
	shutil.copytree('/opt/canopsis/etc', '%s/%s' % (tmp_dir, archive_name))

	logger.debug('Create archive into %s' % output)
	logger.debug('Archive name: %s' % archive_name)
	shutil.make_archive('%s/%s' % (output, archive_name),
						'zip',
						tmp_dir)

	logger.debug('Remove temp dir')
	shutil.rmtree(tmp_dir)

	logger.debug('Config Backup finished')

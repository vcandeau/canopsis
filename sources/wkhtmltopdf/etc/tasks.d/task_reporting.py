from celery.task import task
from cinit import init
from caccount import caccount
from cstorage import cstorage
from cfile import cfile
import os, sys, json

init 	= init()
logger 	= init.getLogger('Reporting Task') 

@task
def render_pdf(filename, viewname, starttime, stoptime, account, wrapper_conf_file):
	libwkhtml_dir=os.path.expanduser("~/lib")
	sys.path.append(libwkhtml_dir)
	try:
		import wkhtmltopdf.wrapper
		# Generate config
		settings = wkhtmltopdf.wrapper.load_conf(	filename,
													viewname,
													starttime,
													stoptime,
													account,
													wrapper_conf_file)
		file_path = open(wrapper_conf_file, "r").read()
		file_path = json.loads(file_path)['report_dir'] + "/" + filename
		# Run rendering
		logger.debug('Run pdf rendering')
		result = wkhtmltopdf.wrapper.run(settings)
		result.wait()
		logger.debug('Put it in grid fs')
		id = put_in_grid_fs(file_path, filename, account)
		logger.debug('Remove tmp report file')
		os.remove(file_path)
		return id
	except Exception, err:
		logger.error(err)

@task
def put_in_grid_fs(file_path, file_name, account):
	storage = cstorage(account, namespace='reports')
	report = cfile(storage=storage)
	report.put_file(file_path, file_name, content_type='application/pdf')
	id = storage.put(report)
	if not report.check(storage):
		logger.error('Report not in grid fs')
		return False
	else:
		return id

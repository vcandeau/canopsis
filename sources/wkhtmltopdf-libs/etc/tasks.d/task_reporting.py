from celery.task import task
from celery.task.sets import subtask
from cinit import cinit
from caccount import caccount
from crecord import crecord
from cstorage import cstorage
from cfile import cfile
from datetime import date
from celerylibs import decorators
import os, sys, json 
import time

#TEST
import task_node
import task_mail

init 	= cinit()
logger 	= init.getLogger('Reporting Task') 

@task
@decorators.log_task
def render_pdf(filename=None, viewname=None, starttime=None, stoptime=None, account=None, wrapper_conf_file=None, mail=None):

	if viewname is None:
		raise ValueError("task_render_pdf : you must at least provide a viewname")

	################setting variable for celery auto launch task##################"

	#if no wrapper conf file set, take the default
	if wrapper_conf_file is None:
		wrapper_conf_file = "/opt/canopsis/etc/wkhtmltopdf_wrapper.json"
	
	#check if the account is just a name or a real caccount
	if isinstance(account ,str) or isinstance(account ,unicode):
		root_account = caccount(user='root',group='root',mail='root@localhost.local')
		root_storage = cstorage(account=root_account, namespace='object')
		
		bd_account = root_storage.find_one(mfilter={'_id':'account.%s' % str(account)})

		if isinstance(bd_account, crecord):
			account = caccount(bd_account)
			logger.info('Successfuly retrieve right user from db')
		else:
			account = caccount(mail='anonymous@localhost.local')
			logger.info('Anonymous account created')
		
	#set stop time
	if stoptime is None:
		starttime = (time.time() - starttime) * 1000
		stoptime = (time.time()) * 1000
	
	#set filename
	if filename is None:
		fromDate = str(date.fromtimestamp(int(starttime) / 1000))
		toDate = str(date.fromtimestamp(int(stoptime) / 1000))
		
		#get crecord name of the view (id is really harsh)
		storage = cstorage(account=account, namespace='object')
		try:
			record = storage.get(viewname,account=account)
			crecord_name = record.name
		except:
			crecord_name = viewname
		
		filename = '%s_From_%s_To_%s' % (crecord_name,fromDate,toDate)
		
	##############################################################################
	
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
		
		#Subtask mail (if needed)
		if isinstance(mail, dict):
			#get cfile
			try:
				reportStorage = cstorage(account=account, namespace='reports')
				meta = reportStorage.get(id)
				meta.__class__ = cfile
			except Exception, err:
				logger.error('Error while fetching cfile : %s' % err)
			
			try:
				mail['account'] = account
				mail['smtp_host'] = "192.168.3.128"
				mail['attachments'] = meta
				task_mail.send.subtask(kwargs=mail).delay()
			except Exception, err:
				logger.error('Mail delivery failed : %s' % err)
			
		return id
	except Exception, err:
		logger.error(err)
		

@task
def put_in_grid_fs(file_path, file_name, account):
	storage = cstorage(account, namespace='reports')
	report = cfile(storage=storage)
	report.put_file(file_path, file_name, content_type='application/pdf')
	report.data['creationTs'] = int(time.time())
	id = storage.put(report)
	if not report.check(storage):
		logger.error('Report not in grid fs')
		return False
	else:
		return id	

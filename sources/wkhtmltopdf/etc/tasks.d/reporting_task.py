from celery.task import task

@task
def render_pdf(filename, viewname, starttime, stoptime, wrapper_conf_file):
	libwkhtml_dir=os.path.expanduser("~/lib")
	sys.path.append(libwkhtml_dir)
	
	try:
		import wkhtmltopdf.wrapper
		# Generate config
		settings = wkhtmltopdf.wrapper.load_conf(	filename,
													viewname,
													starttime,
													stoptime,
													wrapper_conf_file)
		# Run rendering
		return wkhtmltopdf.wrapper.run(settings)
	except Exception, err:
		logger.debug(err)

from celery.task import task

@task
def render_pdf(filename, viewname, starttime, stoptime, wrapper_conf_file):
	import os, sys
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
		print(err)

@task
def put_in_grid_fs(file_path, ip, port, connection, collection):
	from pymongo import Connection
	import gridfs
	conn=Connection(ip, port)
	db=conn[connection]
	fs = gridfs.GridFS(db, collection=collection)

	report_name = file_path.split('/')
	report_name = report_name[len(report_name)-1]
	with open(file_path, "r") as report_file:
		returned_id = fs.put(report_file, content_type="application/pdf", filename=report_name)
	return returned_id

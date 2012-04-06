from celery.task import task
from cinit import cinit
from caccount import caccount
from celerylibs import decorators

init 	= cinit()
logger	= init.getLogger('Mail Task')

@task
@decorators.stock_result_in_db
def send(account=None, recipients=None, subject=None, body=None, attachments=None):
	if isinstance(account, caccount):
		account = caccount(user='root', group='root')
		mail = account.mail
		lastname = account.lastname
		firstname = account.firstname
	else:
		mail = "root@localhost"
		lastname = "root"
		firstname = "root"

	if not isinstance(recipients, list):
		recipients = [recipients]

	print(recipients)
	dests = []
	for dest in recipients:
		dests.append(dest)	

	if not isinstance(attachments, list):
		attachments = [attachments]

	files = []
	for file in attachments:
		files.append(file)

	print('-----')
	print('From		: "%s %s" <%s>' % (firstname, lastname, mail))
	print('Subject	: %s' % subject)
	print('Body		: %s' % body)
	print('To		: %s' % recipients)
	print('Attach.	: %s' % files)

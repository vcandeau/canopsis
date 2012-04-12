from cinit import cinit
from caccount import caccount
from cstorage import cstorage
from crecord import crecord
import time


init 	= cinit()
logger 	= init.getLogger('Task result to db') 

def simple_decorator(decorator):
    def new_decorator(f):
        g = decorator(f)
        g.__name__ = f.__name__
        g.__module__ = f.__module__
        g.__doc__ = f.__doc__
        g.__dict__.update(f.__dict__)
        return g
    new_decorator.__name__ = decorator.__name__
    new_decorator.__doc__ = decorator.__doc__
    new_decorator.__dict__.update(decorator.__dict__)
    return new_decorator

@simple_decorator
def stock_result_in_db(func):
	def wrapper(*args,**kwargs):
		try:
			task_name = kwargs['_scheduled']
			del kwargs['_scheduled']
		except:
			task_name = None
			logger.info('Not scheduled task')
			
		try:
			my_func = func(*args, **kwargs)
			logger.info('Task successfully done')
		except Exception, err:
			function_error = err
			logger.error(err)
			my_func = None


		# Get account/storage
		if isinstance(kwargs['account'],unicode):
			account = caccount(user=kwargs['account'])
		else:
			account = kwargs['account']
			
		storage = cstorage(account=account, namespace='task_log')
		taskStorage = cstorage(account=account, namespace='task')
		
		timestamp = int(time.time())

		# The function have succeed ?
		if my_func:
			if isinstance(my_func, list):
				data = my_func
			else:
				data = [str(my_func)]

			log = {'success': True,'total':1,'output':'Task done','timestamp':timestamp,'data':data}
		else:
			log = {'success': False,'total':1,'output':function_error,'timestamp':timestamp}
		
		#Put the log
		try:
			#if scheduled
			if task_name is not None:
				logger.info('Task scheduled')
				log_record = crecord(log,name=task_name)
				
				#Replace last log with this one
				try:
					mfilter = {'name':task_name}
					search = taskStorage.find_one(mfilter)
					'''
					dict_record = search.dump()
					dict_record['log'] = log
					taskStorage.put(crecord(raw_record=dict_record))
					'''
					search.data['log'] = log
					taskStorage.put(search)
					logger.info('Task log updated')
				except Exception, err:
					logger.error('Error when put log in task_log %s' % err)
				
			else:
				logger.info('Not a scheduled task, put log in db')
				log_record = crecord(log)
				
			#put log in storage
			storage.put(log_record)
		except Exception, err:
			logger.error('Error when put log in task_log %s' % err)
		
		

				
		return my_func
	return wrapper

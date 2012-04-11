from cinit import cinit

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
			my_func = func(*args, **kwargs)
			logger.info('Task successfully done')
		except Exception, err:
			function_error = err
			logger.error(err)
			my_func = None

		# Check if the task was scheduled
		if 'periodic_task_id' in kwargs:
			# Get account/storage
			if isinstance(args[4],unicode):
				account = caccount(user=args[4])
			else:
				account = args[4]

			storage = cstorage(account=account, namespace='task_log')

			# The function have succeed ?
			if my_func:
				if isinstance(my_func, list):
					data = my_func
				else:
					data = [my_func]

				timestamp = int(time.time())
				log = {'success': True,'total':1,'output':'Task done','timestamp':timestamp,'data':data}
			else:
				log = {'success': False,'total':1,'output':function_error,'timestamp':timestamp}

			log_record = crecord(log,name=kwargs['periodic_task_id'])
			storage.put(log_record)
		return my_func
	return wrapper

import collectd

plugin_name = "canopsis_mongodb"

storage = None

namespaces = ['object', 'cache', 'events', 'events_log' ]

### Functions
def put_value(metric, value, type='gauge'):
	metric = collectd.Values(
		plugin = plugin_name,
		type = type,
		values = [value],
		type_instance = metric
	)
	metric.dispatch()

def log(msg):
	collectd.info("%s: %s" % (plugin_name, msg))

### Callbacks
def init_callback():
	log('Init plugin')
	
	from cstorage import get_storage
	from caccount import caccount

	global storage
	root = caccount(user="root", group="root")
	storage = get_storage(account=root, namespace='object')

def config_callback(config):
	log('Config plugin')

def read_callback(data=None):
	for namespace in namespaces:
		put_value(namespace+"_size", storage.get_namespace_size(namespace))		
		
	## Pyperfstore
	size = storage.get_namespace_size("perfdata.fs.chunks") 
	size += storage.get_namespace_size("perfdata.fs.files")
	size += storage.get_namespace_size("perfdata")
	put_value("perfdata_size", size)
	
	## Briefcase
	size = storage.get_namespace_size("binaries.chunks") 
	size += storage.get_namespace_size("binaries.files")
	size += storage.get_namespace_size("files")
	put_value("files_size", size)	
	

### MAIN ###
collectd.register_config(config_callback)
collectd.register_init(init_callback)
collectd.register_read(read_callback)

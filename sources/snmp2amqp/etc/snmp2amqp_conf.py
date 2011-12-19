
port = 162
interface = '0.0.0.0'

mibs = {
	'1.3.6.1.4.1.674.10892.1':		'MIB-Dell-10892',
	'1.3.6.1.4.1.674.10893.1':		'StorageManagement-MIB',
	'1.3.6.1.4.1.674.10893.1.20.200':	'StorageManagement-MIB'
}

blacklist_enterprise=[
	'1.3.6.1.4.1.311.1.1.3.1.2'
]

blacklist_trap_oid=[
	'1.3.6.1.4.1.674.10892.1.0.1306',
	'1.3.6.1.4.1.674.10892.1.0.1304'
]

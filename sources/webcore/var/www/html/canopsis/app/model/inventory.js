Ext.define('canopsis.model.inventory', {
    extend: 'Ext.data.Model',

	fields: [
		{name: '_id'},
		{name: 'host_name'},
		{name: 'service_description'},
		{name: 'state',     type: 'int'},
		{name: 'state_type',  type: 'int'},
		{name: 'timestamp', type: 'int'},
		{name: 'output'}
	],

});

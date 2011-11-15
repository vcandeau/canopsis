Ext.define('canopsis.model.inventory', {
    extend: 'Ext.data.Model',

	fields: [
		{name: '_id'},
		{name: 'host_name'},
		{name: 'service_description'},
		{name: 'source_type'},
		{name: 'type'},
		{name: 'source_name'},
		{name: 'state'},
		{name: 'state_type'},
		{name: 'timestamp'},
		{name: 'output'}
	],

});

Ext.define('canopsis.model.inventory', {
    extend: 'Ext.data.Model',

	fields: [
		{name: '_id'},
		{name: 'host_name'},
		{name: 'service_description'},
		{name: 'state'},
		{name: 'state_type'},
		{name: 'timestamp'},
		{name: 'output'}
	],

});

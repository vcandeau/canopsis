Ext.define('canopsis.model.Group', {
	extend: 'Ext.data.Model',
	fields: [
		{name : 'id'},
		{name : 'crecord_type', defaultValue: 'group'},
		{name : 'crecord_name'},
	],
});

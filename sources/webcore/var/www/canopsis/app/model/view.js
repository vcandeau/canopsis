Ext.define('canopsis.model.view', {
    extend: 'Ext.data.Model',

	fields: [
		{name: 'id'},
		{name: 'crecord_name'},
		{name: 'nbColumns'},
		{name: 'nodeId'},
		{name: 'items'},
		{name: 'rowHeight'},
		{name: 'refreshInterval'}
    ],

});

Ext.define('canopsis.model.view', {
    extend: 'Ext.data.Model',
    fields: [
		{name: 'id'},
		{name: 'name'},
		{name: 'nodeId'},
		{name: 'column'},
		{name: 'items'},
		{name: 'hunit'},
		{name: 'refreshInterval'}
		//{name: 'leaf'}
		],
});

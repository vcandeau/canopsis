Ext.define('canopsis.model.widget', {
    extend: 'Ext.data.Model',
    fields: [
		{name : 'name'},
		{name : 'description',		defaultValue: undefined},
		{name : 'version',		defaultValue: undefined},
		{name : 'author',		defaultValue: undefined},
		{name : 'website',		defaultValue: undefined},
		{name : 'options',		defaultValue: undefined},
		{name : 'xtype'},
		{name : 'colspan',		defaultValue: 1},
		{name : 'rowspan',		defaultValue: 1},
		{name : 'refreshInterval', 	defaultValue: undefined},
		{name : 'nodeId',		defaultValue: undefined},
		{name : 'title', 		defaultValue: undefined},
		{name : 'border', 		defaultValue: false},
		{name : 'rowHeight', defaultValue: undefined},
		{name : 'formWidth', defaultValue: 350}
		]
});

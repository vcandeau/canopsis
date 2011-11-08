Ext.define('canopsis.model.widget', {
    extend: 'Ext.data.Model',
    fields: [
		{name : 'xtype'},
		{name : 'colspan',		defaultValue: 1},
		{name : 'rowspan',		defaultValue: 1},
		{name : 'refreshInterval', 	defaultValue: 0},
		{name : 'nodeId',		defaultValue: undefined},
		{name : 'title', 		defaultValue: undefined},
		{name : 'rowHeight', defaultValue: 200}
		]
});

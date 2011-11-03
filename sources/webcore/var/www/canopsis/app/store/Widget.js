Ext.define('canopsis.store.Widget', {
    extend: 'Ext.data.TreeStore',
    model: 'canopsis.model.Widget',

	fields: [
		{name : 'xtype'},
		{name : 'leaf'},
		{name : 'colspan'},
		{name : 'rowspan'},
		{name : 'type'},
		{name : 'refreshInterval'},
		{name : 'nodeId'},
		{name : 'title'}
	],

	autoLoad: true,
	//autoSync: true,
	//storeId: '',
    proxy: {
		type: 'ajax',
        url: 'data/Widget.json',
        reader: {
            type: 'json',
            //root: 'results'
        }
    },
    
	root: {
		//text: 'results',
		//id: 'root',
		expanded: true
	}
	
});

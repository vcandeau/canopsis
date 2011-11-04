Ext.define('canopsis.store.Widget', {
    extend: 'Ext.data.Store',
    model: 'canopsis.model.widget',


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

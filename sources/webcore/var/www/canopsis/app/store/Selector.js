Ext.define('canopsis.model.Selector', {
    extend: 'Ext.data.Model',

	fields: [
		{name: 'id'},
		{name: 'state'},
    ],

});

Ext.define('canopsis.store.Selector', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.Selector',
	
	storeId: 'store.Selector',
	
	//autoLoad: true,
	
	proxy: {
		type: 'rest',
		url: '/rest/object/selector',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		}
	},
	/*load: function (){
		log.debug('View store loaded.')
		log.dump(this.getById('view.root.dashboard'))
	},*/
});


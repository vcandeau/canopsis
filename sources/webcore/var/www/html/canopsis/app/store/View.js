Ext.define('canopsis.model.View', {
    extend: 'Ext.data.Model',

	fields: [
		{name: 'id'},
		{name: 'crecord_name'},
		{name: 'column'},
		{name: 'lines'},
		{name: 'hunit'},
    ],

});

Ext.define('canopsis.store.View', {
	extend: 'Ext.data.Store',
	model: 'canopsis.model.View',
	storeId: 'store.View',
	autoLoad: true,
	proxy: {
		type: 'rest',
		url: '/rest/object/view',
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


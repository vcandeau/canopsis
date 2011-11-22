Ext.define('canopsis.controller.Group', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['Group.Grid', 'Group.Form'],
	stores: ['Group'],
	models: ['Group'],

	iconCls: 'icon-crecord_type-group',

	logAuthor: '[controller][Group]',

	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.formXtype = 'GroupForm'
		this.listXtype = 'GroupGrid'

		this.modelId = 'Group'

		this.callParent(arguments);
	},

	preSave: function(record){
		record.data.id = 'group.' + record.data.crecord_name
		return record
	}
	
});

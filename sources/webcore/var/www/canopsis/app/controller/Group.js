Ext.define('canopsis.controller.Group', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['Group.Grid', 'Group.Form'],
	stores: ['Group'],
	models: ['Group'],

	iconCls: 'icon-crecord_type-group',

	init: function() {
		console.log('['+this.id+'] - Initialize ...');

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

Ext.define('canopsis.controller.ViewEditor', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['ViewEditor.View', 'ViewEditor.Form'],
	stores: ['View', 'Widget'],
	models: ['view', 'widget'],

	iconCls: 'icon-crecord_type-view',

	init: function() {
		console.log('['+this.id+'] - Initialize ...');

		this.formXtype = 'ConfigView'
		this.listXtype = 'ViewEditor'

		this.modelId = 'view'

		this.callParent(arguments);
	},

});

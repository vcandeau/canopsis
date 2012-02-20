Ext.define('canopsis.view.View.TreePanel' ,{
	extend: 'canopsis.lib.view.ctree',

	//controllerId: 'View',

	alias: 'widget.ViewTreePanel',
	
	store : 'TreeStoreView',
	model : 'view',
	
	initComponent: function() {
		this.callParent(arguments);
	}
});

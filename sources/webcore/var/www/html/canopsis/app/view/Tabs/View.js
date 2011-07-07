Ext.define('canopsis.view.Tabs.View' ,{
	extend: 'Ext.tab.Panel',
	alias : 'widget.TabsView',

	activeTab: 0, // index or id
	bodyBorder: false,
	componentCls: 'cps-headertabs',
	plain: false,

	items:[{
    		title: 'Dashboard',
    		view: 'anonymous-default-dashboard',
			xtype: 'TabsContent',
	}],

	initComponent: function() {
		this.callParent(arguments);
	},
	
	/*listeners: {
		'tabchange': function(tp, p) {
		tp.doLayout();
	}*/	
	
});


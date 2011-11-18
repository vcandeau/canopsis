Ext.define('canopsis.view.Tabs.View' ,{
	extend: 'Ext.tab.Panel',
	alias : 'widget.TabsView',

	activeTab: 0, // index or id
	bodyBorder: false,
	componentCls: 'cps-headertabs',
	plain: false,

/*	items:[{
    		title: 'Dashboard',
    		id: 'dashboard.tab',
    		view: 'anonymous-default-dashboard',
		xtype: 'TabsContent',
	}],*/

	initComponent: function() {
		this.on('afterrender', this._afterrender, this);
		this.callParent(arguments);
	},

	_afterrender: function() {
		show_dashboard()
	}
	
	/*listeners: {
		'tabchange': function(tp, p) {
		tp.doLayout();
	}*/	
	
});


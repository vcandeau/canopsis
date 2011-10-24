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
		//add_view_tab('dashboard.tab', 'Dashboard')

		store = Ext.data.StoreManager.lookup('store.View')
		show_dashboard()
		//store.on('load', function(store, recs, opt){
     		//	add_view_tab('view.root.dashboard', 'Dashboard', false)
		//}, this);

		this.callParent(arguments);
	},
	
	/*listeners: {
		'tabchange': function(tp, p) {
		tp.doLayout();
	}*/	
	
});


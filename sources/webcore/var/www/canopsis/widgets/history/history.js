Ext.define('widgets.history.history' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.history',

	initComponent: function() {
	
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title || this.fullmode) ? false : true,
			namespace: 'history',
			opt_paging: true,
			pageSize: global.pageSize,
			sorters: [{
				property : 'timestamp',
				direction: 'DESC'
			}],
		});

		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
	
	onRefresh: function(data){
		this.grid.load_host(data.host_name)
	},
});

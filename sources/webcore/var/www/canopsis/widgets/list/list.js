Ext.define('widgets.list.list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.list',

	filter: '{"source_type":"host"}',

	initComponent: function() {
	
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title || this.fullmode) ? false : true,
			opt_paging: true,
			filter: this.filter,
			autoload: true,
			pageSize: global.pageSize,
			remoteSort: true,
			sorters: [{
				property : 'host_name',
				direction: 'ASC'
			},{
				property : 'service_description',
				direction: 'ASC'
			}],

			opt_show_host_name: true,
			opt_show_service_description: true,

		});

		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
});

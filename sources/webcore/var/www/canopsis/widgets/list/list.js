Ext.define('widgets.list.list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.list',
	
	//don't work
	//filter: {"source_type":"host"},

	initComponent: function() {
	
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title || this.fullmode) ? false : true,
			opt_paging: true,
			filter: {"source_type":"host"},
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
			
			opt_tbar: true,
			opt_tbar_search: true,
			opt_tbar_search_field: ['host_name', 'service_description'],

			opt_tbar_add: false,
			opt_tbar_duplicate: false,
			opt_tbar_reload: true,
			opt_tbar_delete: false,

		});

		// Bind buttons
		this.ctrl = Ext.create('canopsis.lib.controller.cgrid');
		this.on('afterrender', function() {
			this.ctrl._bindGridEvents(this.grid)
		}, this);

		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
});

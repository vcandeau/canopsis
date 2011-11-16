Ext.define('widgets.state_list.states' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.states',

	initComponent: function() {
		
		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title) ? false : true,
		});

		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
	
	onRefresh: function(data){
		this.grid.load_services_of_host(data.host_name)
	},
});

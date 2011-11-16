Ext.define('widgets.state_list.state_list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.state_list',

	initComponent: function() {
		
		this.grid = Ext.create('canopsis.lib.view.cgrid_state')

		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
	
	onRefresh: function(data){
		this.grid.load_services_of_host(data.host_name)
	},
});

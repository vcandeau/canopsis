Ext.define('widgets.live_events.live_events' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.live_events',

	initComponent: function() {	

		this.grid = Ext.create('canopsis.lib.view.cgrid_state', {
			border: (this.title) ? false : true,
			store: 'LiveEvents'
		});

		this.refreshInterval = 0;
		this.callParent(arguments);

		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);	
	},
});

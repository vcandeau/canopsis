Ext.require([
    'Ext.direct.*',
]);

Ext.define('canopsis.view.Dashboard.View' ,{
	extend: 'Ext.container.Container',

    alias : 'widget.DashboardView', 
    
    border: 0,
    
    initComponent: function() {
		var me = this;
		//add_view_tab('anonymous-dashboard', 'Dashboard')
		
		/*Ext.direct.Manager.addProvider({
			url: "/webservices/view/rpc",
			type: "remoting",
			actions:{
				view:[{
					name:"get_view",
					params:["view"]
				}]
			}
		});
		
		view.get_view({view: 'dashboard'},function(items){
			// Create Widgets
			//Parse Column
			for(var i= 0; i < items.length; i++) {
				//Parse Row
				for(var j= 0; j < items[i]['items'].length; j++) {
					widget = 'canopsis.view.Widgets.'+items[i]['items'][j]['widget']
					//log.debug(widget)
					items[i]['items'][j]['items'] = Ext.create(widget)
				}
			}

			me.add({
				items: Ext.create('canopsis.view.Dashboard.PortalPanel', {items: items})
			});
		});*/
	
		this.callParent(arguments);
    }
});

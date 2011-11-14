Ext.define('widgets.state_list.state_list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.state_list',
	
	//model : 'inventory',
	
	items: [],
	
	
	initComponent: function() {
		
		//creating empty store
		_store = Ext.create('Ext.data.Store', {
			model : 'canopsis.model.inventory',
		});
		
		//inner gridpanel
		grid = Ext.widget('gridpanel',{
			store : _store,
			columns: [{
				header: 'name',
				flex: 2,
				sortable: true,
				dataIndex: '_id',
			}],				
		});
		
		this.callParent(arguments);		
		
		//adding grid to widget
		this.add(grid);
		
		//request data
		if(this.nodeId){
			Ext.Ajax.request({
				url: '/rest/inventory/state/' + this.nodeId,
				scope: this,
				success: function(response){
					var data = Ext.JSON.decode(response.responseText)
					data = data.data
					if (data){
					/*	for (i in data){
							_store.add(Ext.create('inventory', data[i]))
						}*/
					}
				},
				failure: function ( result, request) {
					log.debug('Ajax request failed')
				} 
			});
		}
		
	},
	
	doRefresh: function (){
	},
	
	
});

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
				header: '',
				width: 25,
				sortable: false,
				dataIndex: 'source_type',
				renderer: rdr_source_type
	       		},{
				header: 'name',
				flex: 1,
				sortable: false,
				dataIndex: 'service_description',
			},{
				header: 'information',
				flex: 6,
				sortable: false,
				dataIndex: 'output',
			}],				
		});
		
		this.callParent(arguments);		
		
		//adding grid to widget
		this.add(grid);

		//request data
		//find hostname
		host_name = this.nodeId.split('.')[4];
		if(this.nodeId){
			Ext.Ajax.request({
				url: '/rest/inventory/event?filter={"host_name":"'+ host_name +'","_id": { "$ne" : "' + this.nodeId + '" }}' ,
				scope: this,
				success: function(response){
					var data = Ext.JSON.decode(response.responseText)
					data = data.data
					if (data){
						for (i in data){
							_store.add(Ext.create('canopsis.model.inventory', data[i]))
						}
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

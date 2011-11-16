Ext.define('widgets.state_list.state_list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.state_list',
	
	layout : 'fit',
	
	initComponent: function() {
		//store
		
		this.store = Ext.create('Ext.data.Store', {
			extend: 'canopsis.lib.store.cstore',
			model: 'canopsis.model.inventory',
			
			autoload : true,
			
			storeId: 'store.event',
			proxy: {
				type: 'rest',
				url: '/rest/inventory/event',
				reader: {
					type: 'json',
					root: 'data',
					totalProperty  : 'total',
					successProperty: 'success'
				}
			},
		}),
		
		//inner gridpanel
		grid = Ext.widget('gridpanel',{
			store : this.store,
			columns: [{
				header: '',
				width: 25,
				sortable: false,
				dataIndex: 'source_type',
				renderer: rdr_source_type
	       	},{
				header: 'state',
				sortable: false,
				width: 40,
				dataIndex: 'state',
				renderer: rdr_status
			},{
				header: 'hard?',
				sortable: false,
				width: 40,
				dataIndex: 'state_type',
				renderer: rdr_state_type
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
		this.removeAll();
		this.add(grid);		
	},
	
	onRefresh: function(data){
		this.data = data
		host_name = data._id.split('.')[4];
		this.store.load({
			params : {"filter": '{"host_name":"'+ host_name +'","_id": { "$ne" : "' + this.nodeId + '"}}'}
		});
	}
	
});

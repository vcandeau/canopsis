Ext.define('widgets.state_list.state_list' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.state_list',
	
	layout : 'fit',
	
	initComponent: function() {
		//store
		
		this.store = Ext.create('Ext.data.Store', {
			extend: 'canopsis.lib.store.cstore',
			model: 'canopsis.model.inventory',
			
			sorters: [{
				property : 'state',
				direction: 'DESC'
			}],
			
			storeId: 'store.event',
			proxy: {
				type: 'rest',
				url: '/rest/inventory/event',
				reader: {
					type: 'json',
					root: 'data',
					totalProperty  : 'total',
					successProperty: 'success'
				},
			}
		}),
		
		//inner gridpanel
		this.grid = Ext.widget('gridpanel',{
			store : this.store,
			viewConfig: {
				stripeRows: false,
				getRowClass: this.coloringRow,
			},
			columns: [{
				header: '',
				width: 25,
				sortable: false,
				dataIndex: 'source_type',
				renderer: rdr_source_type
	       		},{
				header: '',
				sortable: false,
				width: 25,
				dataIndex: 'state_type',
				renderer: rdr_state_type
			},{
				header: 'State',
				sortable: false,
				width: 50,
				dataIndex: 'state',
				renderer: rdr_status
			},{
				header: 'Last check',
				sortable: false,
				flex: 2,
				dataIndex: 'timestamp',
				renderer: rdr_tstodate
			},{
				header: 'Name',
				flex: 2,
				sortable: false,
				dataIndex: 'service_description',
			},{
				header: 'Information',
				flex: 3,
				sortable: false,
				dataIndex: 'output',
			}],				
		});
		
		this.callParent(arguments);		
		
		//adding grid to widget 
		this.removeAll();
		this.add(this.grid);
		
	/*	//coloring row
		this.grid.getView().getRowClass = this.coloringRow;
		his.grid.getView().stripeRows = false*/
			
	},
	
	onRefresh: function(data){
		this.data = data;
		host_name = data._id.split('.')[4];
		this.store.load({
			params : {"filter": '{"host_name":"'+ host_name +'","_id": { "$ne" : "' + this.nodeId + '"}}'},
		/*	scope   : this,
			callback : function(){log.debug(this.coloringRow())}*/
		});
	},
	/*
	coloringRow: function(record,index,rowParams,store){
		this.store.each(function(record){
			state = record.get('state');
			index = record.index;
			log.debug(this.grid.getView());
			//this.grid.getView().getRow(index).addClass('row-background-ok');
		}, this);
	}*/
	
	coloringRow : function(record,index,rowParams,store){
		state = record.get('state');
		if (state == 0){
			return 'row-background-ok'
		} else if (state == 1){
			return 'row-background-warning'
		} else {
			return 'row-background-error'
		}
	}
});

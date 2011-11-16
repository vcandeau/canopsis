Ext.define('canopsis.lib.view.cgrid_state' ,{
	extend: 'canopsis.lib.view.cgrid',

	store: false,
	opt_paging: false,
	opt_tbar: false,
	border: true,

	namespace: 'inventory',

	pageSize: 100,

	sorters: [{
			property : 'state',
			direction: 'DESC'
		}],

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


	initComponent: function() {
		//store
		if (! this.store){
			this.store = Ext.create('Ext.data.Store', {
				extend: 'canopsis.lib.store.cstore',
				model: 'canopsis.model.inventory',

				pageSize: this.pageSize,

				sorters: this.sorters,
				
				proxy: {
					type: 'rest',
					url: '/rest/'+this.namespace+'/event',
					reader: {
						type: 'json',
						root: 'data',
						totalProperty  : 'total',
						successProperty: 'success'
					},
				}
			});
		}

		this.viewConfig = {
			stripeRows: false,
			getRowClass: this.coloringRow,
		}
			
		this.callParent(arguments);
	},
	
	coloringRow : function(record,index,rowParams,store){
		state = record.get('state');
		if (state == 0){
			return 'row-background-ok'
		} else if (state == 1){
			return 'row-background-warning'
		} else {
			return 'row-background-error'
		}
	},

	load_services_of_host: function(hostname){
		this.store.proxy.extraParams = {"filter": '{"host_name":"'+ hostname +'", "source_type": "service"}'};
		this.store.load();
	},

	load_host: function(hostname){
		this.store.proxy.extraParams = {"filter": '{"host_name":"'+ hostname +'"}'};
		this.store.load();
	}

});

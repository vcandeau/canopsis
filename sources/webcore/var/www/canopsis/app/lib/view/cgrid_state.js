Ext.define('canopsis.lib.view.cgrid_state' ,{
	extend: 'canopsis.lib.view.cgrid',

	store: false,
	filter: false,
	autoload: false,
	remoteSort: false,

	opt_paging: false,
	opt_tbar: false,

	opt_show_state_type: true,
	opt_show_host_name: false,
	opt_show_service_description: true,
	opt_show_row_background: true,
	
	border: true,

	namespace: 'inventory',

	pageSize: 100,

	sorters: [{
			property : 'state',
			direction: 'DESC'
		}],

	columns: [],

	initComponent: function() {
		this.columns = []

		//set columns
		this.columns.push({
			header: '',
			width: 25,
			sortable: false,
			dataIndex: 'source_type',
			renderer: rdr_source_type
	       	});
	
		if(this.opt_show_state_type){
			this.columns.push({
				header: '',
				sortable: false,
				width: 25,
				dataIndex: 'state_type',
				renderer: rdr_state_type
			});
		}

		this.columns.push({
			header: 'State',
			sortable: false,
			width: 50,
			dataIndex: 'state',
			renderer: rdr_status
		});

		this.columns.push({
			header: 'Last check',
			sortable: false,
			width: 130,
			dataIndex: 'timestamp',
			renderer: rdr_tstodate
		});

		if(this.opt_show_host_name){
			this.columns.push({
				header: 'Host name',
				flex: 1,
				sortable: false,
				dataIndex: 'host_name',
			});
		}

		if(this.opt_show_service_description){
			this.columns.push({
				header: 'Service description',
				flex: 1,
				sortable: false,
				dataIndex: 'service_description',
			});
		}

		this.columns.push({
			header: 'Output',
			flex: 4,
			sortable: false,
			dataIndex: 'output',
		});				

		//store
		if (! this.store){
			this.store = Ext.create('Ext.data.Store', {
				extend: 'canopsis.lib.store.cstore',
				model: 'canopsis.model.inventory',

				pageSize: this.pageSize,

				sorters: this.sorters,

				remoteSort: this.remoteSort,

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

			if (this.filter) {
				this.store.proxy.extraParams = {
					'filter': this.filter
				};
			}

			if (this.autoload) {
				this.store.load();
			}
		}

		this.viewConfig = {
			stripeRows: false,
		}

		if (this.opt_show_row_background){
			this.viewConfig.getRowClass = this.coloringRow;
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

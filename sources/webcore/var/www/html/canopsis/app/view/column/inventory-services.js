Ext.define('canopsis.view.column.inventory-services', {
	columns: [/*{
			text   : 'Host Name',
			width: 120,
			//flex: 1,
			sortable : true,
			//renderer : rdr_host_name,
			dataIndex: 'host_name'
		},*/{
			text   : 'Service Name',
			width: 120,
			//flex: 1,
			sortable : true,
			dataIndex: 'service_description'
		},{
                text   : 'State',
                width    : 50,
                sortable : true,
                renderer : rdr_status,
                dataIndex: 'state'
            },{
                text   : 'Last Check',
                width    : 100,
                sortable : true,
                dataIndex: 'timestamp',
                renderer : rdr_tstodate
            },{
                text   : 'Output',
                flex    : 1,
                sortable : false,
                dataIndex: 'output'
            }
	],
});

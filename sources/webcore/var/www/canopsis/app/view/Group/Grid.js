Ext.define('canopsis.view.Group.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	alias: 'widget.GroupGrid',

	model: 'Group',
	store : 'Group',	

	columns: [
		{
                	header: '',
	                width: 25,
	                sortable: false,
			renderer: rdr_crecord_type,
	                dataIndex: 'crecord_type',
        	},{
        	        header: 'Name',
	                flex: 2,
	                sortable: true,
                	dataIndex: 'crecord_name',
		}
            
	],

	initComponent: function() {
		this.callParent(arguments);
	}

});

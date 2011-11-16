Ext.define('canopsis.view.Account.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	controllerId: 'Account',

	alias: 'widget.AccountGrid',

	model: 'Account',
	store : 'Account',	

	opt_grouping: true,
	opt_paging: true,

	columns: [
		{
                	header: '',
	                width: 25,
	                sortable: false,
			renderer: rdr_crecord_type,
	                dataIndex: 'crecord_type',
        	},{
        	        header: 'Login',
	                flex: 2,
	                sortable: true,
                	dataIndex: 'user',
		},{
	                header: 'First name',
	                flex: 2,
	                sortable: false,
                	dataIndex: 'firstname',
		},{
	                text: 'Last name',
	                flex : 2,
	                sortable: false,
	                dataIndex: 'lastname',
		},{
                	header: 'email',
	                flex: 2,
	                sortable: false,
                	dataIndex: 'mail',
		},{
	                header: 'group',
	                flex: 2,
	                sortable: false,
	                dataIndex: 'aaa_group',
        	},/*{
                	header: 'groups',
	                flex: 2,
	                sortable: false,
	                dataIndex: 'groups',
		}*/
            
	],

	initComponent: function() {
		this.callParent(arguments);
	}

});

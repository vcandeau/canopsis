Ext.define('canopsis.view.Account.Grid' ,{
	extend: 'Ext.grid.Panel',
	alias : 'widget.AccountGrid',
	model: 'Account',
	store : 'Account',
	requires: [
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Text',
        'Ext.toolbar.TextItem'
    ],

	//add an infinite scrolling, beware bugs, the doc say that some stuff can be disabled
	//verticalScrollerType: 'paginggridscroller',
	//invalidateScrollerOnRefresh: false,
	title : 'user list',
	//iconCls: 'icon-grid',
    frame: true,
    id: 'AccountGrid',
    //selType: 'rowmodel',
    //plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
    /*dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                items: [{
                    text: 'Add user',
                    itemId: 'addButton',
                    disabled: false,      
                },{
                    //iconCls: 'icon-delete',
                    text: 'Delete',
                    disabled: false,
                    itemId: 'deleteButton',
                }]
		}],*/

	bbar: [ {
                    text: 'Add user',
                    itemId: 'addButton',
                    disabled: false,      
                },{
                    //iconCls: 'icon-delete',
                    text: 'Delete',
                    disabled: false,
                    itemId: 'deleteButton',
                }],

	columns: [{
                header: 'id',
                flex: 2,
                sortable: true,
                dataIndex: 'id',
            },{
                header: 'Login',
                flex: 2,
                sortable: true,
                dataIndex: 'user',
			},{
                text: 'Last name',
                sortable: true,
                flex : 2,
                dataIndex: 'lastname',
            }, {
                header: 'First name',
                flex: 2,
                sortable: true,
                dataIndex: 'firstname',
			},{
                header: 'email',
                flex: 2,
                sortable: true,
                dataIndex: 'mail',
            },{
                header: 'group',
                flex: 2,
                sortable: true,
                dataIndex: 'aaa_group',
            } ,{
                header: 'groups',
                flex: 2,
                sortable: true,
                dataIndex: 'groups',
            } 
            
            ],
	
	initComponent: function() {
		this.callParent(arguments);
	}

});

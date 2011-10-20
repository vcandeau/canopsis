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
	title : '',
	//iconCls: 'icon-grid',
    //frame: true,
    id: 'AccountGrid',
    border: 0,
    //selType: 'rowmodel',
    //plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
 
	tbar: [ {
                    iconCls: 'icon-add',
                    text: 'Add user',
                    itemId: 'addButton',
                },{
                    iconCls: 'icon-delete',
                    text: 'Delete',
		    disabled: true,
                    itemId: 'deleteButton',
                }],

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
        	},{
                	header: 'groups',
	                flex: 2,
	                sortable: false,
	                dataIndex: 'groups',
		} 
            
            ],
	
	viewConfig: {
            stripeRows: true,
            /*listeners: {
                itemcontextmenu: function(view, rec, node, index, e) {
                    e.stopEvent();
                    contextMenu.showAt(e.getXY());
                    return false;
                }
            }*/
        },
	initComponent: function() {
		this.callParent(arguments);
	}

});

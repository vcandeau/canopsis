Ext.define('canopsis.view.Account.View' ,{
	extend: 'Ext.grid.Panel',
	alias : 'widget.AccountView',
	
	store : 'store.Account',
	requires: [
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Text',
        'Ext.toolbar.TextItem'
    ],

	//add an infinite scrolling, beware bugs, the doc say that some stuff can be disabled
	verticalScrollerType: 'paginggridscroller',
	invalidateScrollerOnRefresh: false,

	iconCls: 'icon-grid',
    //frame: true,
    selType: 'rowmodel',
    plugins: [
        Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToEdit: 2
        })
    ],

    dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                items: [{
                    //iconCls: 'icon-add',
                    text: 'Add',
                    itemId: 'addButton',
                }, {
                    //iconCls: 'icon-delete',
                    text: 'Delete',
                    disabled: false,
                    itemId: 'deleteButton',
                }, {
                    text: 'save',
                    itemId: 'saveButton',
                    disabled: false,                 
                }]
		}],



	columns: [{
                header: 'id',
                flex: 1,
                sortable: true,
                dataIndex: 'id',
            },{
                text: 'Last name',
                sortable: true,
                dataIndex: 'lastname',
                field: {
                    type: 'textfield'
                }
            }, {
                header: 'First name',
                flex: 1,
                sortable: true,
                dataIndex: 'firstname',
                field: {
                    type: 'textfield'
                }
			}, {
                header: 'User',
                flex: 1,
                sortable: true,
                dataIndex: 'User',
                field: {
                    type: 'textfield'
                }
            } ],
	
	initComponent: function() {
		
		//this.editing = Ext.create('Ext.grid.plugin.CellEditing');
	


		this.callParent(arguments);
	}

});

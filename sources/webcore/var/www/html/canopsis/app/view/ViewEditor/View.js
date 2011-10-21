Ext.define('canopsis.view.ViewEditor.View' ,{
	extend: 'Ext.grid.Panel',
	alias : 'widget.ViewEditor',
	
	
	
	//model: 'Menu',
	store: 'ViewEditor',
	
	id : 'ViewEditor',

    title: 'Available Views',

	/*
    viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},
    */
    
	tbar: [ {
				iconCls: 'icon-add',
				text: 'Add new view',
				itemId: 'addButton',
			},{
				iconCls: 'icon-delete',
				text: 'Delete',
				itemId: 'deleteButton',
			}],

	columns: [{
					header: 'name',
					flex: 2,
					sortable: true,
					dataIndex: 'crecord_name',
				},{
					header: 'id',
					flex: 2,
					sortable: true,
					dataIndex: 'id',
				},/* {
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
				} */
	],

	initComponent: function() {
			this.callParent(arguments);
		}
			
});

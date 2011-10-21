Ext.define('canopsis.view.ViewEditor.View' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.ViewEditor',
	
	
	
	//model: 'view',
	store: 'ViewEditor',
	rootVisible: false,	
	id : 'ViewEditor',

    title: 'Available Views',

	
    viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},
    
    
	tbar: [ {
				iconCls: 'icon-add',
				text: 'Add new view',
				itemId: 'addButton',
			},{
				iconCls: 'icon-delete',
				text: 'Delete',
				itemId: 'deleteButton',
				disabled: true,
			}],

	columns: [{
					header: 'name',
					flex: 2,
					sortable: true,
					dataIndex: 'name',
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

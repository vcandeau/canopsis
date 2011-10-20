Ext.define('canopsis.view.ViewEditor.View' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.ViewEditor',
	model: 'Menu',
	store: 'ViewEditor',

    title: 'Available Views',
    rootVisible: false,
    //hideHeaders: true,
	rootVisible: false,
	title: 'Menu',
	animCollapse: false,
	collapsible: false,
    
	tbar: [ {
				iconCls: 'icon-add',
				text: 'Add user',
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
					dataIndex: 'text',
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

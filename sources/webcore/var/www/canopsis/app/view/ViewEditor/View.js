Ext.define('canopsis.view.ViewEditor.View' ,{
	extend: 'Ext.grid.Panel',
	alias : 'widget.ViewEditor',
	
	
	
	//model: 'view',
	store: 'ViewEditor',
	rootVisible: false,	
	id : 'ViewEditor',

    title: 'Available Views',
    /*
    viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},
    */
    
    multiSelect: true,
    
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
				}/*,
				{
					header: 'items',
					flex: 2,
					sortable: true,
					dataIndex: 'items',
				}*/
	],

	initComponent: function() {
			this.callParent(arguments);
		},
		
	beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.")
	}

	
			
});

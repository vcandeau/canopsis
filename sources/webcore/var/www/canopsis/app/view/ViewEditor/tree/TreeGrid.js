Ext.define('canopsis.view.ViewEditor.tree.TreeGrid' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.TreeGrid',
	model: 'widget',
	store: 'Widget',
	
	id: 'TreeGrid',
	
	//title: 'Available options',
	title: '',
	//collapsible: true,
	//useArrows: true,
	rootVisible: false,
	//multiSelect: true,
	//singleExpand: true,
	//the 'columns' property is now 'headers'
	
	columns: [{
            text: 'widget',
            flex: 2,
            //sortable: true,
            dataIndex: 'xtype',
        }/*,{
			text: 'title',
			dataIndex: 'title',
			//hidden : true
		},{
			text: 'colspan',
			dataIndex: 'colspan',
			//hidden : true
		},/*{
			text: '_id',
			dataIndex: '_id',
			hidden : true
		},{
			text: '',
			dataIndex: 'rinterval',
			hidden : true
		}*/],

	/*root: {
		//text: 'Menu',
		//id: 'root',
		expanded: true
	},*/
	
	
	
	initComponent: function() {
		this.callParent(arguments);
	}
	
});

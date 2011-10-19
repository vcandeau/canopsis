Ext.define('canopsis.view.Config.treeGrid' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.treeGrid',
	model: 'Widget',
	store: 'Widget',
	
	id: 'treeGrid',
	
	title: 'Available options',
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
            dataIndex: 'text',
        }/*,{
			text: 'title',
			dataIndex: 'title',
			hidden : true
		},{
			text: 'colspan',
			dataIndex: 'colspan',
			hidden : true
		},{
			text: '_id',
			dataIndex: '_id',
			hidden : true
		},{
			text: '',
			dataIndex: 'rinterval',
			hidden : true
		}*/],
        
        
/*	root: {
			name: 'Root',
			description: 'Root description',
			expanded: true,
			children: [{
				text: 'kpi',
				title: 'truc',
				colspan: '5',
				_id : 'fdesqeq',
				rinterval : '58',
				leaf: true
			}, {
				text: 'highcharts',
				title: 'freu',
				colspan: '65',
				_id : 'frfrqre',
				rinterval : '10',
				leaf: true
			}]
		},
	*/
	/*root: {
		//text: 'Menu',
		//id: 'root',
		expanded: true
	},*/
	
	
	
	initComponent: function() {
		this.callParent(arguments);
	}
	
});

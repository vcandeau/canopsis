Ext.define('canopsis.view.column.selectors', {
  columns: [{
			text   : 'ID',
			width: 120,
			//flex: 1,
			sortable : true,
			dataIndex: '_id',
			field: {
				xtype: 'textfield',
				//allowBlank: false
				}
		},{
			text   : 'Name',
			width: 120,
			//flex: 1,
			sortable : true,
			dataIndex: 'name',
			field: {
				xtype: 'textfield',
				//allowBlank: false
				}
		},{
			text   : 'Description',
			width    : 200,
			sortable : true,
			dataIndex: 'description',
			field: {
				xtype: 'textfield',
				//allowBlank: false
			}
		},{
			text   : "Collection",
			width    : 60,
			flex: 1,
			sortable : true,
			dataIndex: 'collection',
			field: {
				xtype: 'textfield',
				flex: 1,
				//allowBlank: false
				}
		},{
			text   : "Filter",
			//width    : 100,
			flex: 1,
			sortable : true,
			dataIndex: 'filter',
			renderer : function (val) { return Ext.JSON.encode(val);},
			field: {
				xtype: 'textfield',
				flex: 1,
				//allowBlank: false
			}
		}
	]
});

Ext.define('canopsis.view.LiveSearch.Grid' ,{
	extend: 'Ext.grid.Panel',
	alias: 'widget.LiveGrid',

	store : 'Inventory',
	id: 'LiveGrid',

	requires: [
		'Ext.grid.plugin.CellEditing',
		'Ext.form.field.Text',
		'Ext.toolbar.TextItem'
	],

	title : '',
	//iconCls: 'icon-grid',
	//frame: true,
	features: [Ext.create('Ext.grid.feature.Grouping',{
        groupHeaderTpl: 'Source type: {source_type}'
    })],

	border: false,
 
	columns : [
				{header : 'type', dataIndex : 'source_type', flex : 1},
				{header : 'name', dataIndex : '_id', flex : 1},
	],
 
	initComponent: function() {
		this.callParent(arguments);
	}

});

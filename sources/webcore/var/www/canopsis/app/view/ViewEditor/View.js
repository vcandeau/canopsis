Ext.define('canopsis.view.ViewEditor.View' ,{
	extend: 'canopsis.lib.view.cgrid',

	alias : 'widget.ViewEditor',
	
	model: 'view',
	store: 'View',

   
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
		}],	
			
});

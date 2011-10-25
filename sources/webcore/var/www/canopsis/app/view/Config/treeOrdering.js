Ext.define('canopsis.view.Config.treeOrdering' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.treeOrdering',
	model : 'widget',
	
	//store: store,
	id: 'treeOrdering',
	
	viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},
	//height: 300,
	//width: 250,
	title: 'User config panel',
	//useArrows: true,
	rootVisible: false,	
	//toggleOnDblClick: false,
	/*selType: 'cellmodel',
	plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 2
    })],*/
    
    bbar: [{
		text : 'delete selected row',
		itemId : 'deleteRow'
	},{
		xtype: 'tbseparator'
	},{
		text : 'clear all',
		itemId : 'clearAll'
	}],

	columns: [{
		xtype: 'treecolumn', //this is so we know which column will show the tree
		text: 'Option name',
		flex: 1,
		sortable: true,
		dataIndex: 'xtype'
	},{
		//we must use the templateheader component so we can use a custom tpl
		//xtype: 'templatecolumn',
		text: 'title',
		flex: 1,
		sortable: true,
		dataIndex: 'title',
		//align: 'center',
	},{
		text: 'colspan',
		flex: 1,
		dataIndex: 'colspan',
	},{
		text: '_id',
		flex: 1,
		dataIndex: '_id',
	},{
		text: 'refresh interval',
		flex: 1,
		dataIndex: 'rinterval',
	}],
	
	/*root: {
        name: 'Root',
        expanded: true,
	},*/
	
	initComponent: function() {

		this.callParent(arguments);
		
		
	}
	
	
});

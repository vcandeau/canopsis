Ext.define('canopsis.view.Config.TreeOrdering' ,{
	extend: 'Ext.tree.Panel',
	alias : 'widget.TreeOrdering',
	model : 'widget',
	
	//store: store,
	id: 'TreeOrdering',
	
	viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},
	//height: 300,
	//width: 250,
	//title: 'User config panel',
	title: '',
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
		action : 'deleteRow'
	},{
		xtype: 'tbseparator'
	},{
		text : 'clear all',
		action : 'reset'
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
		text: 'length',
		flex: 1,
		dataIndex: 'colspan',
	},{
		text: '_id',
		flex: 1,
		dataIndex: '_id',
	},{
		text: 'refresh interval',
		flex: 1,
		dataIndex: 'refreshInterval',
	}],
	
	/*root: {
        name: 'Root',
        expanded: true,
	},*/
	
	initComponent: function() {

		this.callParent(arguments);
		
		
	}
	
	
});

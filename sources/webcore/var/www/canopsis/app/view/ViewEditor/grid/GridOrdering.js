Ext.define('canopsis.view.ViewEditor.grid.GridOrdering' ,{
	extend: 'Ext.grid.Panel',
	alias : 'widget.GridOrdering',
	model: 'widget',
	//store: 'Widget',
	
	/*store: new Ext.data.Store({
        model: 'canopsis.model.widget',
    }),*/
	id: 'GridOrdering',
	
/*	viewConfig: {
		plugins: {
			ptype: 'treeviewdragdrop'
		}
	},*/
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
		text: 'Option name',
		flex: 1,
		dataIndex: 'xtype'
	},{
		//we must use the templateheader component so we can use a custom tpl
		//xtype: 'templatecolumn',
		text: 'title',
		flex: 1,
		dataIndex: 'title',
		//align: 'center',
	},{
		text: 'length',
		flex: 1,
		dataIndex: 'colspan',
	},{
		text: 'height',
		flex: 1,
		dataIndex: 'rowspan',
	},{
		text: 'nodeId',
		flex: 1,
		dataIndex: 'nodeId',
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
		this.store = new Ext.data.Store({
        model: 'canopsis.model.widget',
    });
		this.callParent(arguments);
	}
	
	
});

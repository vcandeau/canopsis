Ext.define('canopsis.lib.view.cgrid' ,{
	extend: 'Ext.grid.Panel',

	id: 'cgrid',

	requires: [
		'Ext.grid.plugin.CellEditing',
		'Ext.form.field.Text',
		'Ext.toolbar.TextItem'
	],

	title : '',
	//iconCls: 'icon-grid',
	//frame: true,

	border: 0,
	//selType: 'rowmodel',
	//plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
 
	tbar: [ {
                    iconCls: 'icon-add',
                    text: 'Add user',
                    itemId: 'addButton',
                },{
                    iconCls: 'icon-delete',
                    text: 'Delete',
		    disabled: true,
                    itemId: 'deleteButton',
                }],
 
	initComponent: function() {
		console.log('[view][cgrid] - Initialize ...');
		this.callParent(arguments);
	}

});

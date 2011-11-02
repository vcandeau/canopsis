Ext.define('canopsis.lib.view.cgrid' ,{
	extend: 'Ext.grid.Panel',

	controllerId: 'cgrid',

	requires: [
		'Ext.grid.plugin.CellEditing',
		'Ext.form.field.Text',
		'Ext.toolbar.TextItem'
	],

	title : '',
	//iconCls: 'icon-grid',
	//frame: true,

	border: false,
	//selType: 'rowmodel',
	//plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
 
	tbar: [ {
                    iconCls: 'icon-add',
                    text: 'Add user',
                    action: 'add',
                },{
                    iconCls: 'icon-reload',
                    text: 'Reload',
                    action: 'reload',
                },'-',{
                    iconCls: 'icon-delete',
                    text: 'Delete',
		    disabled: true,
                    action: 'delete',
                }],
 
	initComponent: function() {
		this.callParent(arguments);
	}

});

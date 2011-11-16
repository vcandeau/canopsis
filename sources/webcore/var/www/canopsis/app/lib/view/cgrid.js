Ext.define('canopsis.lib.view.cgrid' ,{
	extend: 'Ext.grid.Panel',

	requires: [
		'Ext.grid.plugin.CellEditing',
		'Ext.form.field.Text',
		'Ext.toolbar.TextItem'
	],

	// Options
	opt_grouping: false,
	opt_paging: false,

	features: [],
	
	

	title : '',
	//iconCls: 'icon-grid',
	//frame: true,

	border: false,
	//selType: 'rowmodel',
	//plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
 
	tbar: [ {
                    iconCls: 'icon-add',
                    text: 'Add',
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
		/*if (this.opt_grouping){
			var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
				hideGroupedColumn: true,
				groupHeaderTpl: '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
			});
			this.features.push(groupingFeature);
		}*/

		if (this.opt_paging){
			var pagingbar = Ext.create('Ext.PagingToolbar', {
				store: this.store,
				displayInfo: false,
				emptyMsg: "No topics to display",
				handler: function() {
					this.refresh.hideParent = true;
					this.refresh.hide();
				}
				
			});
        
			this.bbar = pagingbar;
			
			this.bbar.items.items[10].hide();
		}

		this.callParent(arguments);
	}

});

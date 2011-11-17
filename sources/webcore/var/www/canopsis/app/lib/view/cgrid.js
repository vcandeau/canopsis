Ext.define('canopsis.lib.view.cgrid' ,{
	extend: 'Ext.grid.Panel',

	requires: [
		'Ext.grid.plugin.CellEditing',
		'Ext.form.field.Text',
		'Ext.toolbar.TextItem'
	],

	// Options
	opt_grouping: false,
	opt_paging: true,
	opt_tbar: true,

	opt_menu_delete: true,
	opt_menu_duplicate: true,

	features: [],
	
	

	title : '',
	//iconCls: 'icon-grid',
	//frame: true,

	border: false,
	//selType: 'rowmodel',
	//plugins: [Ext.create('Ext.grid.plugin.RowEditing', {clicksToEdit: 2, pluginId: 'editAccount'})],
 
	initComponent: function() {
		/*if (this.opt_grouping){
			var groupingFeature = Ext.create('Ext.grid.feature.Grouping',{
				hideGroupedColumn: true,
				groupHeaderTpl: '{name} ({rows.length} Item{[values.rows.length > 1 ? "s" : ""]})'
			});
			this.features.push(groupingFeature);
		}*/


		//------------------Option docked bar--------------
		if (this.opt_tbar){
			this.tbar = [{
                 	iconCls: 'icon-add',
				    text: 'Add',
				    action: 'add',
				},{
                 	iconCls: 'icon-add',
				    text: 'Duplicate',
				    action: 'duplicate',
				},{
				    iconCls: 'icon-reload',
				    text: 'Reload',
				    action: 'reload',
				},'-',{
				    iconCls: 'icon-delete',
				    text: 'Delete',
				    disabled: true,
				    action: 'delete',
				}
			];
		}
		
		//--------------------Paging toolbar -----------------
		if (this.opt_paging){
			this.pagingbar = Ext.create('Ext.PagingToolbar', {
				store: this.store,
				displayInfo: false,
				emptyMsg: "No topics to display",
			});
        
			this.bbar = this.pagingbar;
			this.bbar.items.items[10].hide();
			
		}
		
		//--------------------Context menu---------------------
		if (this.opt_menu_delete || this.opt_menu_duplicate){
			this.contextMenu = Ext.create('Ext.menu.Menu');
			
			if(this.opt_menu_delete){
				var deleteAction = Ext.create('Ext.Action', {
					//icon   : '../shared/icons/fam/delete.gif',  // Use a URL in the icon config
					text: 'Delete',

				});
				this.contextMenu.add(deleteAction);
			}
			if (this.opt_menu_duplicate){
				var duplicateAction = Ext.create('Ext.Action', {
					//icon   : '../shared/icons/fam/delete.gif',  // Use a URL in the icon config
					text: 'Duplicate',
				});
				this.contextMenu.add(duplicateAction);
			}
		}


		this.callParent(arguments);
	}

});

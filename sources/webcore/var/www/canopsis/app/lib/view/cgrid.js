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
	opt_tbar_add:true,
	opt_tbar_duplicate: false,
	opt_tbar_reload:true,
	opt_tbar_delete:true,
	opt_tbar_search: false,
	opt_tbar_search_field: [],


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
			this.tbar = []
			
			if(this.opt_tbar_add){
				this.tbar.push({
					iconCls: 'icon-add',
					text: 'Add',
					action: 'add',
				})
			}
			if(this.opt_tbar_duplicate){
				this.tbar.push({
					iconCls: 'icon-copy', 
					text: 'Duplicate',
					action: 'duplicate',
				})
			}
			if(this.opt_tbar_reload){
				this.tbar.push({
					iconCls: 'icon-reload',
					text: 'Reload',
					action: 'reload',
				})
			}
			if(this.opt_tbar_delete){
				this.tbar.push({
					iconCls: 'icon-delete',
					text: 'Delete',
					disabled: true,
					action: 'delete',
				})
			}
			if(this.opt_tbar_search){
				this.tbar.push({xtype: 'tbfill'});
				this.tbar.push({
					xtype: 'textfield',
					name: 'searchField',
					hideLabel: true,
					width: 200,
				})
				this.tbar.push({
					xtype : 'button',
					action: 'search',
					text: 'search'
				})
			}
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
		if (this.opt_tbar){
			this.contextMenu = Ext.create('Ext.menu.Menu');
			
			if(this.opt_tbar_delete){
				this.contextMenu.add(
					Ext.create('Ext.Action', {
						iconCls: 'icon-delete',
						text: 'Delete',
						action: 'delete',
					})
				)
			}
			if (this.opt_tbar_duplicate){
				this.contextMenu.add(
					Ext.create('Ext.Action', {
						iconCls: 'icon-copy',
						text: 'Duplicate',
						action: 'duplicate',
					})
				)
			}
		}


		this.callParent(arguments);
	}

});

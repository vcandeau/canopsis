Ext.define('canopsis.view.ViewEditor.Form' ,{
	extend: 'Ext.panel.Panel',

	alias : 'widget.ConfigView',
	
	items: [],

	layout: {
		type: 'table',
		tableAttrs: {
			style: {
				width: '100%',
            		}
		},
	},    

	tbar: [{
		iconCls: 'icon-save',
		text: 'Save',
		action : 'save',
	},{
		iconCls: 'icon-cancel',
		text: 'Cancel',
		action: 'cancel',
	}
	],
	
	initComponent: function() {
		this.on('beforeclose', this.beforeclose)

		//var totalWidth = this.getWidth() - 20
		var totalWidth = 800

		this.nbColumns = 4
		this.layout.columns = this.nbColumns
		this.layout.tableAttrs.style.width = totalWidth

		this.DefaultWidth = (totalWidth/this.nbColumns)

		this.defaults = {
			width: this.DefaultWidth,
			height: 200,
			padding:4,
		}
		
		this.callParent(arguments);

		this.removeAll();
		
		var GlobalOptions =  Ext.create('Ext.form.Panel', {
			colspan: 2,
			width: this.DefaultWidth * 2,
			border: 0,
			defaultType: 'textfield',
			items : [{
					fieldLabel: 'view\'s name',
					itemId: 'crecord_name',
					name: 'crecord_name',
					allowBlank: false,
				},{
					fieldLabel: 'refresh interval',
					itemId : 'refreshInterval',
					name: 'refreshInterval',
				},{
					fieldLabel: 'nb column',
					itemId: 'nbColumn',
					name: 'nbColumn',
				},
				Ext.create('canopsis.lib.form.field.cinventory', {
					multiSelect: false,
				})
			]
		});

		//fixing layout (table goes wild without it)
		for (i; i<this.nbColumns; i++){
			this.add({ html: '', border: 0, height: 0, padding:0})
		}


		var Preview = Ext.create('Ext.panel.Panel', { 
			colspan: 2,
			width: this.DefaultWidth * 2,
		});

		var Widgets =  Ext.create('Ext.grid.Panel', {
			store: 'Widget',
			columns: [{
				header: 'widget',
				dataIndex: 'xtype',
				flex: 1
       			 }],
		});
		
		this.ItemsStore = Ext.create('Ext.data.Store', {
				model: 'cinventory',});

		var ItemsList = Ext.create('Ext.grid.Panel', {
			store: this.ItemsStore,
			
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
					text: 'title',
					flex: 1,
					dataIndex: 'title',
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
				
			html: 'Items List', colspan: 3, width: this.DefaultWidth * 3 
		});

		////////////Add panels to view////////////////
		this.GlobalOptions = this.add(GlobalOptions);
		this.Preview = this.add(Preview);
		this.add(Widgets);
		this.ItemsList = this.add(ItemsList);
		
		//////////////binding events//////////////////
		//autolaunch  Previews
		this.ItemsStore.on('datachanged', function(){this.createPreview(this.ItemsStore,Preview,GlobalOptions)}, this);
		GlobalOptions.down('#nbColumn').on('change', function(){this.createPreview(this.ItemsStore,Preview,GlobalOptions)}, this);
		
		//others listeners
		Widgets.on('itemdblclick',this.addItem,this);
		
		var deleteRowButton = Ext.ComponentQuery.query('#' + ItemsList.id + ' button[action=deleteRow]');
		deleteRowButton[0].on('click',function(){this.deleteButton(ItemsList)}, this);
		
		var clearAllButton = Ext.ComponentQuery.query('#' + ItemsList.id + ' button[action=reset]');
		clearAllButton[0].on('click',function(){this.ItemsStore.removeAll()},this);
	},
	
	deleteButton: function(grid) {
		log.debug('[controller][cgrid][Form] - clicked on deleteRow Button');
		var selection = grid.getSelectionModel().getSelection();
		if (selection) {
			this.ItemsStore.remove(selection);
			log.debug('[controller][cgrid][Form] - record deleted')
		}
	},
	
	
	addItem : function(view, item, index) {
		copy = Ext.ClassManager.instantiate('canopsis.model.widget',item.data);
		this.ItemsStore.add(copy);
	},

	loadRecord: function(record){
		widgets =  record.data.items;
		for (i in widgets){
					//console.log(widgets[i])
					copy = Ext.ClassManager.instantiate('canopsis.model.widget',widgets[i]);
					//console.log(copy)
					this.ItemsStore.add(copy);
		}
		this.GlobalOptions.down('#crecord_name').setValue(record.get('crecord_name'));
		this.GlobalOptions.down('#refreshInterval').setValue(record.get('refreshInterval'));
		this.GlobalOptions.down('#nbColumn').setValue(record.get('nbColumn'));
	},
	


	beforeclose: function(tab, object){
		console.log('[ViewEditor][cform] - Active previous tab');
		old_tab = Ext.getCmp('main-tabs').old_tab;
		if (old_tab) {
			Ext.getCmp('main-tabs').setActiveTab(old_tab);
		}
	},

	beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.")
	},
	
	createPreview : function(store, container, options) {
		console.log('[ViewEditor][cform] - Creating preview')
		//cleaning and adding new preview
		container.removeAll();
		
		//get number of column
		if (options.down('#nbColumn').getValue()){
			var nbColumn = options.down('#nbColumn').getValue();
			console.log('column defined');
		} else {
			var nbColumn = 5;
			console.log('column by default');
		}

		var myLayout = []
		myLayout['type'] = 'table';
		myLayout['columns'] = nbColumn;
		//need this container for columns
		var preview = container.add({
			xtype: 'panel',
			border: 0,
			layout : myLayout,
			defaults: {
				height: 40,
				padding:4,
				tableAttrs: {
					style: {
						width: '100%',
							}
				},
			}
		});
		
		//starting loop
		var totalWidth = container.getWidth() - 20;
		store.each(function(record) {
			panel_width = ((100/nbColumn) * record.data.colspan)/100 * totalWidth;
			base_heigth = 30 * record.data.rowspan;
			preview.add({
				xtype : 'panel',
				html : record.data.xtype,
				colspan : record.data.colspan,
				rowspan : record.data.rowspan,
				width : panel_width,
				height : base_heigth,
			});
		});
	},
	
	
	
	
});

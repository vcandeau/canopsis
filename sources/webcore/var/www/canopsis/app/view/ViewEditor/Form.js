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
					fieldLabel: 'Name',
					//itemId: 'crecord_name',
					name: 'crecord_name',
					allowBlank: false,
				},{
					xtype: 'numberfield',
					fieldLabel: 'Refresh interval',
					//itemId : 'refreshInterval',
					name: 'refreshInterval',
					value: 0,
					minValue: 0
				},{
					xtype: 'numberfield',
					fieldLabel: 'Nb column',
					//itemId: 'nbColumns',
					name: 'nbColumns',
					value: 1,
					minValue: 0
				},
				{
					xtype: 'numberfield',
					fieldLabel: 'Row height',
					//itemId: 'nbColumns',
					name: 'rowHeight',
					minValue: 0
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
			title : 'Preview',
			colspan: 2,
			width: this.DefaultWidth * 2,
			layout : 'fit',
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
			
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop'
				}
			},
			
			
			
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
					dataIndex: 'xtype',
					sortable: false,
				},{
					text: 'Title',
					flex: 1,
					sortable: false,
					dataIndex: 'title',
				},{
					text: 'Colspan',
					flex: 1,
					sortable: false,
					dataIndex: 'colspan',
				},{
					text: 'Rowspan',
					flex: 1,
					sortable: false,
					dataIndex: 'rowspan',
				},{
					text: 'Row height',
					flex: 1,
					sortable: false,
					dataIndex: 'rowHeight',
				},{
					text: 'NodeId',
					flex: 1,
					sortable: false,
					dataIndex: 'nodeId',
				},{
					text: 'Refresh interval',
					flex: 1,
					sortable: false,
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
		GlobalOptions.down('numberfield[name=nbColumns]').on('change', function(){this.createPreview(this.ItemsStore,Preview,GlobalOptions)}, this);
		
		//others listeners
		Widgets.on('itemdblclick',this.addItem,this);
		ItemsList.on('itemdblclick',this.ModifyItem,this);
		
		var deleteRowButton = Ext.ComponentQuery.query('#' + ItemsList.id + ' button[action=deleteRow]');
		deleteRowButton[0].on('click',function(){this.deleteButton(ItemsList)}, this);
		
		var clearAllButton = Ext.ComponentQuery.query('#' + ItemsList.id + ' button[action=reset]');
		clearAllButton[0].on('click',function(){this.ItemsStore.removeAll()},this);
	},
	
	ModifyItem : function(view, item, index){
			var test = item.nodeId;
			//alert(item.data.nodeId);
			log.debug('[controller][cgrid][Form][WidgetForm] - Widget window');
			this.window = Ext.create('Ext.window.Window', {
				closable: true,
				title: 'Edit ' + item.data.xtype,
				items:[{
					xtype : 'cform',
					model: 'widget',
					closeAction: 'hide',
					width: 300,
					height: 270,
					items:[{
							fieldLabel: 'title',
							name: 'title',
						},{
							xtype: 'numberfield',
							fieldLabel: 'Colspan',
							name: 'colspan',
						},{
							xtype: 'numberfield',
							fieldLabel: 'Rowspan',
							name: 'rowspan',
						},{
							xtype: 'numberfield',
							fieldLabel: 'Refresh interval',
							name: 'refreshInterval',
						},{
							xtype: 'numberfield',
							fieldLabel: 'RowHeight',
							name: 'rowHeight',
						},
						Ext.create('canopsis.lib.form.field.cinventory', {
							multiSelect: false,
						})
					]
				}]
			});
			this.window.show();
			this.window.down('cform').getForm().loadRecord(item);
			if (item.data.nodeId){
				tab = []
				tab.push(item.data.nodeId);
				this.window.down('cform').down('panel').LoadStore(tab);
			}
			
			////////////////////add listeners on button////////////////
			var WidgetForm = this.window.down('cform')
			WidgetForm.down('button[action=cancel]').on('click',function(){this.window.hide()},this);
			//Save Button
			WidgetForm.down('button[action=save]').on('click',
			function(){
					console.log('[controller][cgrid][Form][WidgetForm]');
					record = WidgetForm.getRecord();
					record.set(WidgetForm.getValues());
					//if nodeId is defined
					var nodeId = WidgetForm.down('gridpanel').store.getAt(0);
					if (nodeId){
						record.set('nodeId', nodeId.get('id'));
					}
					this.window.hide();
					this.createPreview(this.ItemsStore,this.Preview,this.GlobalOptions);
				},this);				
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
		this.GlobalOptions.down('textfield[name=crecord_name]').setValue(record.get('crecord_name'));
		this.GlobalOptions.down('numberfield[name=refreshInterval]').setValue(record.get('refreshInterval'));
		this.GlobalOptions.down('numberfield[name=nbColumns]').setValue(record.get('nbColumns'));
		this.GlobalOptions.down('numberfield[name=rowHeight]').setValue(record.get('rowHeight'));
		//needed for loading node, cf ViewEditor controller, beforeload_EditForm function
		this.nodeId = record.get('nodeId');
		/*console.log ('nodeId');
		console.log(this.nodeId);*/
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
		//console.log('[ViewEditor][cform] - Creating preview')
		//cleaning and adding new preview
		container.removeAll();
		
		//get number of column
		if (options.down('numberfield[name=nbColumns]').getValue()){
			var nbColumns = options.down('numberfield[name=nbColumns]').getValue();
			//console.log('column defined');
		} else {
			var nbColumns = 1;
			//console.log('column by default');
		}

		//set the layout
		if(store.getCount() != 1)
		{
			//console.log('store != 1 fixing layout table')
			var myLayout = []
			myLayout['type'] = 'table';
			myLayout['columns'] = nbColumns;
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
		} else {
			//console.log('store == 1 , fixing layout fit')
			var preview = container.add({
				xtype: 'panel',
				border: 0,
				layout : 'fit',
			});
		}
		
		//starting loop
		var totalWidth = container.getWidth() - 20;
		
		if (store.getCount() == 1)
		{
			//console.log('Preview : only one record, adding it fullscreen')
			record = store.getAt(0)
			preview.add({
					xtype : 'panel',
					html : record.data.xtype,
					width : '100%'
			});
		
		}else{
			//console.log('Preview : many records set multiple items')
			store.each(function(record) {
				panel_width = ((100/nbColumns) * record.data.colspan)/100 * totalWidth;
				if (record.data.rowspan){
					base_heigth = 30 * record.data.rowspan;
					//base_heigth = 30;
				}else{
					base_heigth = 30;
				}
				
				///////////////////////TODO//////////////////
				////////Fix the exception with rowspan///////
				/////////////////////////////////////////////
				try {		
					preview.add({
						xtype : 'panel',
						html : record.data.xtype,
						colspan : record.data.colspan,
						rowspan : record.data.rowspan,
						width : panel_width,
						height : base_heigth,
					});
				} catch(err) {
					console.log(err);
				}
			});
		}
	},
	
	
	
});

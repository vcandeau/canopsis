Ext.define('canopsis.lib.form.field.cinventory' ,{
	extend: 'Ext.grid.Panel',

	window: false,
	multiSelect: true,
	//width: '100%',

	initComponent: function() {
		log.debug('[cinventory] - Initialize ...')

		this.tbar = [ 'Select Items','->',{
			iconCls: 'icon-add',
			text: 'Add',
			scope: this,
 			handler: this.DisplaySelWindow
                }]

		if (! this.multiSelect){
			this.grow = false
		}

		Ext.define('cinventory', {
			extend: 'Ext.data.Model',
			fields: [
				{name : 'id'},
				{name : 'type'},
				{name : 'source_name'},
				{name : 'source_type'},
				{name : 'service_description'},
				{name : 'host_name'},
			],
		});

		this.Win_columns = [/*{
				header: 'Id',
				dataIndex: 'id',
	       		},*/{
				header: 'Node Name',
				flex: 1,
				dataIndex: 'host_name',
	       		},{
        		        header: 'Service',
				flex: 2,
				dataIndex: 'service_description',
		}];

		this.columns = this.Win_columns

		this.InventoryStore = Ext.create('Ext.data.Store', {
				model: 'cinventory',
				proxy: {
					type: 'rest',
					url: '/rest/inventory',
					reader: {
						type: 'json',
						root: 'data',
						totalProperty  : 'total',
						successProperty: 'success'
					},
					writer: {
						type: 'json',
						writeAllFields: false,
					},
				},
		})
		
		this.store = Ext.create('Ext.data.Store', {
				model: 'cinventory',
		});

		this.callParent(arguments);
	},

	DisplaySelWindow: function(field, options){
		this.blur()
		if (! this.window){

			var firstGrid = Ext.create('Ext.grid.Panel', {
				multiSelect: this.multiSelect,
				flex : 1,
				viewConfig: {
					plugins: {
 						ptype: 'gridviewdragdrop',
						dragGroup: 'firstGridDDGroup',
						dropGroup: 'secondGridDDGroup'
					},
					/*listeners: {
						drop: function(node, data, dropRec, dropPosition) {
							var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
						}
 					}*/
        			},
				store: this.InventoryStore,
				columns: this.Win_columns,
				stripeRows: true,
				title: 'Inventory',
   			});

			firstGrid.on('itemdblclick',function(grid, record, item, index){
				if (! this.multiSelect){
					this.store.removeAt(0)
				}
				this.store.add(record)
			}, this);

			var secondGrid = Ext.create('Ext.grid.Panel', {
				multiSelect: this.multiSelect,
				flex : 1,
				//border: 0,
				viewConfig: {
					plugins: {
						ptype: 'gridviewdragdrop',
						//dragGroup: 'secondGridDDGroup',
						dropGroup: 'firstGridDDGroup'
					},
				},		
				store: this.store,
				columns: this.Win_columns,
				stripeRows: true,
				//title: 'Selection',
   			});

			secondGrid.on('drop', function(node, data, dropRec, dropPosition) {
				if (! this.multiSelect){
					if (dropPosition == 'after'){
						this.store.removeAt(0)
					}else{
						this.store.removeAt(1)
					}
				}
				var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
			}, this);

			secondGrid.on('itemdblclick',function(grid, record, item, index){
				this.store.removeAt(index)
			}, this);

			this.on('itemdblclick',function(grid, record, item, index){
				this.store.removeAt(index)
			}, this);

			var searchForm = Ext.create('Ext.form.Panel', {
				border: 0,
				defaultType: 'textfield',
				//bodyStyle: 'padding: 5px;',
				//height: 100,
				flex : 1,
				items: [/*{
					fieldLabel: 'Type',
					name: 'type',
				},*/{
					fieldLabel: 'Source',
					name: 'source_name',
				},{
					fieldLabel: 'Source Type',
					name: 'source_type',
				},{
					fieldLabel: 'Node',
					name: 'host_name',
				},{
					fieldLabel: 'Service',
					name: 'service_description',
				}],
			});

			var displayPanel = Ext.create('Ext.Panel', {
				layout: {
					type: 'vbox',
					align: 'stretch',
					padding: 5
				},
				title: 'Search',
				border: 1,
				flex : 1,
				items: [searchForm, secondGrid],
				dockedItems: {
					xtype: 'toolbar',
					dock: 'bottom',
					items: [{
						text: 'Empty selection',
						iconCls: 'icon-delete',
						action: 'empty-selection'
            				},'->',{
						text: 'Set Selection',
						iconCls: 'icon-save',
						action: 'set-selection'
            				}]
      				}
			});

			log.debug('[cinventory] Create window')
			this.window = Ext.create('widget.window', {
				title: 'Inventory selection',
				closable: true,
				closeAction: 'hide',
				width: 700,
				//minWidth: 350,
				height: 400,
				//bodyStyle: 'padding: 5px;',
				layout: {
					type: 'hbox',
					align: 'stretch',
					//padding: 5,
				},
				defaults: { padding: 5 },
				items: [displayPanel, firstGrid]
			});

			this.window.show();

			this.KeyNav = Ext.create('Ext.util.KeyNav', this.window.id, {
				scope: this,
				enter: function(){
					this.InventoryStore.load()
				}
			});

			// Bind Button
			Ext.ComponentQuery.query('#' + this.window.id + ' button[action=empty-selection]')[0].on('click', function(){
				this.store.removeAll()
			}, this);

			Ext.ComponentQuery.query('#' + this.window.id + ' button[action=set-selection]')[0].on('click', function(){

				this.window.hide()
				this.InventoryStore.removeAll()
			}, this);
			
		}else{
			log.debug('[cinventory] Show window')
			this.window.show()
		}
	},

	beforeDestroy : function() {
		Ext.grid.Panel.superclass.beforeDestroy.call(this);
	        log.debug("[cinventory] " + this.id + " Destroyed.")
	}

});

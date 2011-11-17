Ext.define('canopsis.lib.form.field.cinventory' ,{
	extend: 'Ext.grid.Panel',

	window: false,
	multiSelect: true,
	ids: false,
	
	last_search : '',

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

		var model = Ext.ModelManager.getModel('cinventory');
		if (! model){
			Ext.define('cinventory', {
				extend: 'Ext.data.Model',
				fields: [
					{name : 'id'},
					{name : 'type'},
					{name : 'source_name'},
					{name : 'source_type'},
					{name : 'service_description'},
					{name : 'host_name'},
					{name : 'perf_data'},
				],
			});
		}

		this.Win_columns = [{
				header: '',
				width: 25,
				sortable: false,
				dataIndex: 'source_type',
				renderer: rdr_source_type
	       		},{
				header: '',
				width: 25,
				sortable: false,
				dataIndex: 'perf_data',
				renderer: rdr_havePerfdata
	       		},{
				header: 'Node Name',
				flex: 1,
				dataIndex: 'host_name',
	       		},{
        		        header: 'Service',
				flex: 2,
				dataIndex: 'service_description',
		}];

		this.columns = this.Win_columns

		//------------------- create stores---------------
		this.InventoryStore = Ext.create('Ext.data.Store', {
			
				model: 'cinventory',
				pageSize: 10,
				proxy: {
					type: 'rest',
					url: '/rest/inventory/event',
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

		this.LoadStore(this.ids)

		this.callParent(arguments);
	},

	LoadStore: function(ids) {
		//load list of ids in store
		if (ids){
			// format url argument
			var i;
			var ids_txt="";
			for (i in ids){
				if (ids[i]){
					ids_txt = ids_txt + "," + ids[i]
				}
			}
			if (ids_txt){
				// request
				Ext.Ajax.request({
					url: '/rest/inventory/state/' + ids_txt,
					scope: this,
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data
						if (data){
							if (this.multiSelect){
								var i;
								for (i in data){
									this.store.add(Ext.create('cinventory', data[i]))
								}
							}else{
								this.store.add(Ext.create('cinventory', data[0]))
							}
						}
					},
					failure: function ( result, request) {
						log.debug('Ajax request failed')
					} 
				})
			}
		}
	},

	DisplaySelWindow: function(field, options){
		this.blur()
		if (! this.window){

			//--------------------stores-----------------
			
			var comboSourceTypeStore = Ext.create('Ext.data.Store', {
				fields: ['name'],
				data : [
					{"name":"all"},
					{"name":"host"},
					{"name":"service"}
				]
			});

			var comboTypeStore = Ext.create('Ext.data.Store', {
				fields: ['name'],
				data : [
					{"name":"all"},
					{"name":"check"},
				]
			});
			
			//-----------------------grids--------------------



			var firstGrid = Ext.create('canopsis.lib.view.cgrid', {
				multiSelect: this.multiSelect,
				opt_tbar: false,
				border: true,
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

			var secondGrid = Ext.create('canopsis.lib.view.cgrid', {
				multiSelect: this.multiSelect,
				opt_tbar: false,
				border: true,
				opt_paging: false,
				flex : 4,
				viewConfig: {
					plugins: {
						ptype: 'gridviewdragdrop',
						//dragGroup: 'secondGridDDGroup',
						dropGroup: 'firstGridDDGroup'
					},
					listeners: {
						drop: function(node, data, dropRec, dropPosition) {
							if (! this.multiSelect){
								if (dropPosition == 'after'){
									this.store.removeAt(0)
								}else{
									this.store.removeAt(1)
								}
							}
						}
	 				},
				},		
				store: this.store,
				columns: this.Win_columns,
				stripeRows: true,
				//title: 'Selection',
   			});

			secondGrid.on('itemdblclick',function(grid, record, item, index){
				this.store.removeAt(index)
			}, this);

			this.on('itemdblclick',function(grid, record, item, index){
				this.store.removeAt(index)
			}, this);

			//------------------Search Options-------------------

			this.comboSourceType = Ext.create('Ext.form.ComboBox', {
				fieldLabel: 'Source type',
				store: comboSourceTypeStore,
				queryMode: 'local',
				displayField: 'name',
				forceSelection: true,
				editable: false,
				value: 'all',
				name : 'source_type'
			});

			this.comboType = Ext.create('Ext.form.ComboBox', {
				fieldLabel: 'Type',
				store: comboTypeStore,
				queryMode: 'local',
				displayField: 'name',
				forceSelection: true,
				editable: false,
				value: 'all',
				name : 'type'
			});

			this.searchForm = Ext.create('Ext.form.Panel', {
				border: 0,
				defaultType: 'textfield',
				//bodyStyle: 'padding: 5px;',
				//height: 100,
				flex : 2,
				items: [{
					fieldLabel: 'Search',
					name: 'search',
					allowBlank: false,
				},/*{
					fieldLabel: 'Type',
					name: 'type',
				},{
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
				}*/],
			});

			this.searchForm.add(this.comboSourceType);
			this.searchForm.add(this.comboType);

			var displayPanel = Ext.create('Ext.Panel', {
				layout: {
					type: 'vbox',
					align: 'stretch',
					padding: 5
				},
				title: 'Search',
				border: 1,
				flex : 1,
				items: [this.searchForm, secondGrid],
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

			//------------------------binding------------------------------

			this.KeyNav = Ext.create('Ext.util.KeyNav', this.window.id, {
				scope: this,
				enter: function(){
					var form = this.searchForm.getForm()
					if (form.isValid()){
						var values = form.getValues();
						//clean searching values
						search = values.search
						mfilter = '{'
						if (values.source_type != 'all'){
							mfilter += '"source_type":"'+ values.source_type +'"';
						}
						
						if ((values.source_type != 'all') && (values.type != 'all')){
							mfilter += ',"type":"'+ values.type +'"';
						} else if (values.type != 'all'){
							mfilter += '"type":"'+ values.type +'"';
						}
						
						mfilter += "}"
						log.debug(mfilter);
						
						//request data
						if (search == this.old_search){
							this.InventoryStore.load();
						} else {
							this.InventoryStore.proxy.extraParams = {
								'search' : search,
								'filter': mfilter
							};
							this.InventoryStore.load();
							//paging toolbar return to first page
							if (this.InventoryStore.count() !=0 ){
								firstGrid.pagingbar.moveFirst();
							}
						}
						//log.debug(this.InventoryStore.proxy);
					}
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

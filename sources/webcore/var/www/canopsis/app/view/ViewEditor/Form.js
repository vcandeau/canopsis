/*
#--------------------------------
# Copyright (c) 2011 "Capensis" [http://www.capensis.com]
#
# This file is part of Canopsis.
#
# Canopsis is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Canopsis is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with Canopsis.  If not, see <http://www.gnu.org/licenses/>.
# ---------------------------------
*/
Ext.define('canopsis.view.ViewEditor.Form' ,{
	extend: 'Ext.panel.Panel',

	alias : 'widget.ConfigView',
	
	items: [],
	border: 0,

	layout: {
		type: 'table',
		/*tableAttrs: {
			style: {
				width: '100%',
            		}
		},*/
	},    
	
	autoScroll: true,

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
		this.on('afterrender', this.afterrender, this)
		
		this.callParent(arguments);
	},

	afterrender: function() {
		var totalWidth = this.getWidth() - 20 //scroll

		this.nbColumns = 4
		this.layout.columns = this.nbColumns
		//this.layout.tableAttrs.style.width = totalWidth

		this.DefaultWidth = (totalWidth/this.nbColumns)

		this.defaults = {
			width: this.DefaultWidth,
			height: 250,
			padding:4,
		}

		this.removeAll();
		
		this.globalNodeId = Ext.create('canopsis.lib.form.field.cinventory', {
								multiSelect: false,});
		
		var GlobalOptions =  Ext.create('Ext.form.Panel', {
			colspan: 2,
			width: this.DefaultWidth * 2,
			border: 0,
			defaultType: 'textfield',
			items:[{
						xtype: 'fieldset',
						flex: 3,
						title: 'Global options',
						layout: 'anchor',
						defaults: {
							anchor: '100%',
							hideEmptyLabel: true
						},
						
						items : [{
								xtype : 'textfield',
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
								value: 200,
								minValue: 0
							},{
								xtype: 'panel',
								layout: 'hbox',
								border: false,
								items : [{
										xtype: 'checkboxfield',
										boxLabel  : 'Reporting :',
										name      : 'reporting',
										boxLabelAlign : 'before'
									},{ xtype: 'tbspacer', width: 50 },{
										xtype: 'checkboxfield',
										boxLabel  : 'Template :',
										name      : 'template',
										boxLabelAlign : 'before'
									},
							]},
								this.globalNodeId
						]
					}]
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

			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					enableDrop: false,
					copy: true
				}
			},

			columns: [{
				header: 'Name',
				dataIndex: 'name',
				flex: 1
       			 },{
				header: 'Description',
				dataIndex: 'description',
				flex: 2
       			 }],
		});
		
		this.ItemsStore = Ext.create('Ext.data.Store', {
				model: 'cinventory',});

		var ItemsList = Ext.create('canopsis.lib.view.cgrid', {
			store: this.ItemsStore,
			
			border: true,
			
			opt_paging: false,
			
			opt_bar_bottom: true,
			
			opt_bar: true,
			opt_bar_add:false,	
			
			opt_bar_reload:false,
			opt_bar_delete:true,
			
			//opt_keynav_del: true,
			
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					//enableDrag: false,
					//copy: true
				},
				listeners: {
					beforedrop: function(node, data, dropRec, dropPosition, dropFunction) {
						//small hack for copy record when drop
						if (data.view.id != ItemsList.view.id){ //not self DD!
							var copy = Ext.create('canopsis.model.widget', data.records[0].data);
							data.records[0] = copy
						}
					}
	 			},
			},
				columns: [{
					header: '',
					width: 25,
					sortable: false,
					dataIndex: 'xtype',
					renderer: rdr_widget_preview
	       		},{
					text: 'Option name',
					flex: 1,
					dataIndex: 'name',
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
		
		var ItemsList_ctrl = Ext.create('canopsis.lib.controller.cgrid');
		ItemsList_ctrl._bindGridEvents(ItemsList);
		

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

	},
	
	ModifyItem : function(view, item, index){
			//var test = item.nodeId;
			log.debug('[controller][cgrid][Form][WidgetForm] - Widget window');
			
			
			this.window = Ext.create('Ext.window.Window', {
				closable: true,
				closeAction: 'destroy',
				title: 'Edit ' + item.data.xtype,
				
				beforeclose : function() {
						log.debug("Destroy items ...", this.logAuthor)
						canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
						log.debug(this.id + " Destroyed.", this.logAuthor)
				}
				
			});
			
			//cinventory for following panel
			this.widgetNodeId = Ext.create('canopsis.lib.form.field.cinventory', {
								prefetch_id: (this.globalNodeId.getStore().count()) ? this.globalNodeId.getStore().getAt(0).get('component') : undefined,
								multiSelect: false,
							})
			
			//Widget configuration panel
			var form = Ext.widget('cform', {
					model: 'widget',
					//closeAction: 'hide',
					//Width : 350,
					layout: {
						type: 'hbox',
						align: 'stretch'
					},
					margin: '0 0 10',					
					items:[
					{
						xtype: 'fieldset',
						flex: 1,
						title: 'Widget Configuration',
						layout: 'anchor',
						defaults: {
							anchor: '100%',
							hideEmptyLabel: true
						},
					
						items : [{
									xtype : 'textfield',
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
								this.widgetNodeId
							]
					}
					,{
						xtype: 'component',
						width: 10
					}]
				});
			
			//loading the id if exist, in order to prepare the second panel creation (nodeId needed)
			if (item.data.nodeId){
				tab = []
				tab.push(item.data.nodeId);
				this.widgetNodeId.LoadStore(tab);
			}
			
			//add this pannel to window
			this.window.add(form);
			
			//add second panel only if options exist
			if (item.data.options)
			{
				//check if combobox exist and give it a store
				this.loadComboBox(item)	
		
				//this.window.down('cform').setWidth(this.formWidth);
				this.window.widgetOptionsPanel = form.add({
					xtype: 'fieldset',
					flex: 1,
					title: 'Widget options',
					layout: 'anchor',

					defaults: {
						anchor: '100%',
					},
					items : item.data.options,
				});
				
				//bind action when store change
				this.widgetNodeId.store.on('datachanged', function(){
					this.refreshComboStore()
				}, this);
			}
			
			this.window.show();
			//showing and loading the window
			form.setWidth(item.data.formWidth);
			form.setHeight(310);
			form.getForm().loadRecord(item);

			////////////////////Bind events////////////////
			var WidgetForm = this.window.down('cform')
			WidgetForm.down('button[action=cancel]').on('click',function(){
				this.window.close()},this);
			/////////////////Save Button///////////////////
			WidgetForm.down('button[action=save]').on('click',
			function(){
					log.debug('[controller][cgrid][Form][WidgetForm]');
					record = WidgetForm.getRecord();
					new_values = WidgetForm.getValues();
					record.set(new_values);
					//if nodeId is defined
					var nodeId = this.widgetNodeId.store.getAt(0);
					if (nodeId){
						record.set('nodeId', nodeId.get('id'));
					}
					//processing options
					if (item.data.options)
					{ 
						for(var i in item.data.options)
						{
							//cleaning combobox store
							if(record.data.options[i].xtype == "combo"){
								//record.data.options[i].store.destroy();
								record.data.options[i].store = null;
							}
							record.data.options[i].value = new_values[record.data.options[i].name]
						}	
					}
					
					this.window.destroy();
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
		copy = Ext.create('canopsis.model.widget',item.data);
		this.ItemsStore.add(copy);
		log.debug('[controller][cgrid][Form] - item added')
	},

	loadRecord: function(record){
		widgets =  record.data.items;
		this.GlobalOptions.down('textfield[name=crecord_name]').setValue(record.get('crecord_name'));
		this.GlobalOptions.down('numberfield[name=refreshInterval]').setValue(record.get('refreshInterval'));
		this.GlobalOptions.down('numberfield[name=nbColumns]').setValue(record.get('nbColumns'));
		this.GlobalOptions.down('numberfield[name=rowHeight]').setValue(record.get('rowHeight'));
		//needed for loading node, cf ViewEditor.js controller, beforeload_EditForm function
		this.nodeId = record.get('nodeId');
		
		for (i in widgets){
					copy = Ext.ClassManager.instantiate('canopsis.model.widget',widgets[i]);
					this.ItemsStore.add(copy);
		}

	},
	
	loadComboBox : function(item){
		//create store if combobox metric option
		log.debug('enter loadComboBox');
		for (i in item.data.options){
			//if there is combobox in option
			if ( item.data.options[i].xtype == "combo" ){
				//if the field is for metric
				if (item.data.options[i].name == "metric"){
					//if nodeId already specified in widget
					if(item.get('nodeId')){
						var storeUrl = item.get('nodeId');
					} else if(this.globalNodeId.getStore().getAt(0)){
						//else check if global id is specified
						var record = this.globalNodeId.getStore().getAt(0);
						if (record.get('_id')){
							var storeUrl = record.get('_id');
						} else if (record.get('id')){
							var storeUrl = record.get('id');
						}
					}
					log.debug(storeUrl)
					this.comboMetricStore = Ext.create('canopsis.lib.store.cstore', {
						fields: ['metric'],
						proxy: {
								type: 'rest',
								url: '/perfstore/metrics/' + storeUrl,
								reader: {
									type: 'json',
									root: 'data',
									totalProperty  : 'total',
									successProperty: 'success',
								}
						}
					});
					//put store in option
					item.data.options[i].store = this.comboMetricStore;
				}
			}
		}
	},

	refreshComboStore : function(){
		panel = this.window.widgetOptionsPanel
		record = this.widgetNodeId.getStore().getAt(0)
		//log.debug('enter refreshcombo')
		if (record.get('_id')){
			var storeUrl = record.get('_id');
		} else if (record.get('id')){
			var storeUrl = record.get('id');
		}
		var panelItems = panel.items.items
		//search all combox in widget options
		for (i in panelItems){
			if(panelItems[i].xtype == 'combo'){
				panelItems[i].store.proxy.url = '/perfstore/metrics/' + storeUrl;
				panelItems[i].lastQuery = null;
				if(panelItems[i].disabled == true){
					panelItems[i].setDisabled(false);
				}
				//log.dump(panelItems[i].store.proxy.url)
			}	
		}
		
	},

	beforeclose: function(tab, object){
		log.debug('[ViewEditor][cform] - Active previous tab');
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
		container.removeAll();
		
		//get number of column
		if (options.down('numberfield[name=nbColumns]').getValue()){
			var nbColumns = options.down('numberfield[name=nbColumns]').getValue();
		} else {
			var nbColumns = 1;
		}

		//set the layout and populate preview
		if(store.getCount() != 1)
		{
			//log.debug('store != 1 fixing layout table')
			var myLayout = [];
			myLayout['type'] = 'table';
			myLayout['columns'] = nbColumns;
			//need this container for columns
			var preview = container.add({
				xtype: 'panel',
				border: 0,
				layout : myLayout,
				defaults: {
					//height: 40,
					padding:4,
					tableAttrs: {
						style: {width: '100%'}
					},
				}
			});
			
			///////////////starting loop///////////////////
			var totalWidth = container.getWidth() - 20;
			
			store.each(function(record) {
				panel_width = ((100/nbColumns) * record.data.colspan)/100 * totalWidth;
				if (record.data.rowspan){
					base_heigth = 30 * record.data.rowspan;
				}else{
					base_heigth = 30;
				}
				
				///////////////////////TODO//////////////////
				////////Fix the exception with rowspan///////
				/////////////////////////////////////////////
				try {		
					preview.add({
						xtype : 'panel',
						html : "<div style='text-align: center;'>" + record.data.name + "</div>",
						bodyStyle:{"background-color": global.default_colors[store.indexOf(record)]},
						colspan : record.data.colspan,
						rowspan : record.data.rowspan,
						width : panel_width,
						height : base_heigth,
					});
				} catch(err) {
					log.debug(err);
				}
			});
			
		} else {
			//if there is only one item, we switch full screen
			log.debug('[controller][cgrid][Form] - only one item, fullscreen mode')
			var preview = container.add({
				xtype: 'panel',
				border: 0,
				layout : 'fit',
			});
			
			var totalWidth = container.getWidth() - 20;
			record = store.getAt(0)
			preview.add({
					xtype : 'panel',
					html : "<div style='text-align: center;'>" + record.data.xtype + "</div>",
					width : '100%'
			});
			
		}
	}
	
});

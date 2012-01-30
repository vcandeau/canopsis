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
Ext.define('canopsis.lib.form.field.cinventory' ,{
	extend: 'Ext.grid.Panel',

	window: false,
	multiSelect: true,
	ids: false,
	
	last_search : '',
	
	search_type : 'all',
	search_source_type : 'all',
	prefetch_id : '',

	//width: '100%',

	initComponent: function() {
		log.debug('[cinventory] - Initialize ...')

		this.tbar = [ _('Select Items'),'->',{
			iconCls: 'icon-add',
			text: _('Add'),
			scope: this,
 			handler: this.DisplaySelWindow
                }]

		if (! this.multiSelect){
			this.grow = false
		}

		var model = Ext.ModelManager.getModel('canopsis.model.event');
		//var model = 'canopsis.model.event';

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
					header: _('Component'),
					flex: 1,
					dataIndex: 'component',
	       		},{
					header: _('Resource'),
					flex: 2,
					dataIndex: 'resource',
		}];

		this.columns = this.Win_columns

		//------------------- create stores---------------
		this.InventoryStore = Ext.create('canopsis.lib.store.cstore', {
			
				model: model,
				pageSize: 10,
				proxy: {
					type: 'rest',
					url: '/rest/events/event',
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
				model: model,
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
					url: '/rest/events/state/' + ids_txt,
					scope: this,
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data
						if (data){
							if (this.multiSelect){
								var i;
								for (i in data){
									this.store.add(Ext.create('canopsis.model.event', data[i]))
								}
							}else{
								this.store.add(Ext.create('canopsis.model.event', data[0]))
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
					{"name":"component"},
					{"name":"resource"}
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
				opt_bar: false,
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
				title: _('Inventory'),
   			});
   			
   			//needed to move page in paging from function searchFunction
   			this.firstGrid = firstGrid;

			firstGrid.on('itemdblclick',function(grid, record, item, index){
				if (! this.multiSelect){
					this.store.removeAt(0)
				}
				this.store.add(record)
			}, this);

			var secondGrid = Ext.create('canopsis.lib.view.cgrid', {
				multiSelect: this.multiSelect,
				opt_bar: false,
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
				//title: _('Selection'),
   			});

			secondGrid.on('itemdblclick',function(grid, record, item, index){
				this.store.removeAt(index)
			}, this);

			this.on('itemdblclick',function(grid, record, item, index){
				this.store.removeAt(index)
			}, this);

			//------------------Search Options-------------------

			comboSourceType = Ext.create('Ext.form.ComboBox', {
				fieldLabel: _('Source type'),
				store: comboSourceTypeStore,
				queryMode: 'local',
				displayField: 'name',
				forceSelection: true,
				editable: false,
				value: this.search_source_type,
				name : 'source_type'
			});

			comboType = Ext.create('Ext.form.ComboBox', {
				fieldLabel: _('Type'),
				store: comboTypeStore,
				queryMode: 'local',
				displayField: 'name',
				forceSelection: true,
				editable: false,
				value: this.search_type,
				name : 'type'
			});

			this.searchForm = Ext.create('Ext.form.Panel', {
				border: 0,
				buttonAlign: 'right',
				defaultType: 'textfield',
				//bodyStyle: 'padding: 5px;',
				//height: 100,
				flex : 3,
				items: [{
					fieldLabel: _('Search'),
					name: 'search',
					//allowBlank: false,
				}],
			});
			
			var searchButton = Ext.create('Ext.Button', {
				text: _('Search'),
			});

			this.searchForm.add(comboSourceType);
			this.searchForm.add(comboType);
			this.searchForm.add(searchButton);

			//----------------building dislay pannel---------------

			var displayPanel = Ext.create('Ext.Panel', {
				layout: {
					type: 'vbox',
					align: 'stretch',
					padding: 5
				},
				title: _('Search'),
				border: 1,
				flex : 1,
				items: [this.searchForm, secondGrid],
				dockedItems: {
					xtype: 'toolbar',
					dock: 'bottom',
					items: [{
						text: _('Empty selection'),
						iconCls: 'icon-delete',
						action: 'empty-selection'
            				},'->',{
						text: _('Use Selection'),
						iconCls: 'icon-save',
						action: 'set-selection'
            				}]
      				}
			});

			log.debug('[cinventory] Create window')
			this.window = Ext.create('widget.window', {
				title: _('Inventory selection'),
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
			
			//---------------diplay and launch prefetch--------------------

			this.window.show();
			this.prefetch();
			this.window.down('textfield[name="search"]').focus('', 700); 

			//------------------------binding------------------------------

			this.KeyNav = Ext.create('Ext.util.KeyNav', this.window.id, {
				scope: this,
				enter: this.searchFunction
			});

			// Bind Button
			searchButton.on('click',this.searchFunction, this);
			
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
	},

	prefetch : function(){
		if (this.prefetch_id != ''){
			this.searchForm.down('textfield[name="search"]').setValue(this.prefetch_id);
			this.searchFunction();
		}
	},
	
	searchFunction : function(){
		var form = this.searchForm.getForm()
		if (form.isValid()){
			var values = form.getValues();
			//clean searching values
			var search = values.search

			log.debug('[cinventory] Search: '+search);

			var filter = {};

			if (search){
				if (search == '*'){
					filter["_id"] = { "$regex" : ".*" };
				}else{
					filter["_id"] = { "$regex" : ".*"+search+".*", "$options" : "i"};
				}
			}

			if (values.source_type != 'all'){
				filter["source_type"] = values.source_type;
			}			
			if (values.type != 'all'){
				filter["type"] = values.type;
			}

			log.debug("[cinventory] Filter:");
			log.dump(filter);

			this.firstGrid.pagingbar.moveFirst();
			this.InventoryStore.search(filter);
		}
	},

	getValue : function(){
		var record = this.store.getAt(0)
		if(record){
			return record.get('id')
		} else {
			return undefined
		}
	},

	setValue : function(data){
		
	}

});

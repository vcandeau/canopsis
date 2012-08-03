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

Ext.define('canopsis.lib.form.field.cmetric' , {
	extend: 'Ext.panel.Panel',
	mixins: ['canopsis.lib.form.cfield'],

	alias: 'widget.cmetric',

	border: false,
	layout: {
        type: 'vbox',
        align: 'stretch'
    },

	initComponent: function() {
		this.logAuthor = '[' + this.id + ']';
		log.debug('Initialize ...', this.logAuthor);

		this.build_stores();
		this.build_grids();
		
		this.on('afterrender', function() {
			this.bind_event();
		}, this);
		
		var config = {
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			flex: 2
		};

		var container = Ext.create('Ext.container.Container', config);

		container.add(this.meta_grid);

		this.items = [container, this.selected_grid];

		this.callParent(arguments);
	},

	build_stores: function() {
		log.debug('Build stores', this.logAuthor);

		var model = Ext.ModelManager.getModel('canopsis.model.Meta');
		if (! model) {
			Ext.define('Meta', {
				extend: 'Ext.data.Model',
				fields: [
					{name: '_id'},
					{name: 'id', mapping: '_id'},
					{name: 'co'},
					{name: 're', defaultValue: undefined},
					{name: 'me'},
				]
			});
		}

		this.meta_store = Ext.create('canopsis.lib.store.cstore', {
				model: 'Meta',
				proxy: {
					 type: 'ajax',
					 url: '/perfstore/get_all_metrics',

					 reader: {
						 type: 'json',
						 root: 'data'
					}
				 },
				 autoLoad: true
		});

		this.selected_store = Ext.create('canopsis.lib.store.cstore', {
				model: 'Meta'
		});

	},

	build_grids: function() {
		log.debug('Build grids', this.logAuthor);
	
		//-------------------------first grid--------------------
		this.meta_grid = Ext.create('canopsis.lib.view.cgrid', {
			store: this.meta_store,
			flex: 2,
			margin: 3,

			opt_menu_rights: false,
			opt_bar: true,
			opt_bar_search: true,
			opt_bar_add: false,
			opt_allow_edit: false,
			opt_bar_duplicate: false,
			opt_bar_reload: true,
			opt_bar_delete: false,
			opt_paging: true,
			opt_simple_search: true,

			border: true,

			columns: [
					{
					header: _('Component'),
					sortable: false,
					dataIndex: 'co',
					flex: 1
	       		},{
					header: _('Resource'),
					sortable: false,
					dataIndex: 're',
					flex: 1
	       		},{
					header: _('Metric'),
					sortable: false,
					dataIndex: 'me',
					flex: 1
	       		}
			],
			viewConfig: {
				copy: true,
				plugins: {
					ptype: 'gridviewdragdrop',
					enableDrop: false,
					dragGroup: 'search_grid_DNDGroup'
				}
			}
		});

		// Create controller and bind with meta_grid
		this.meta_grid_ctrl = Ext.create('canopsis.lib.controller.cgrid');
		this.meta_grid.on('afterrender', function() {
			this.meta_grid_ctrl._bindGridEvents(this.meta_grid);
		}, this);

		
		//------------------------ Selection grid---------------------

		this.selected_grid = Ext.widget('grid', {
			store: this.selected_store,
			flex: 1,
			margin: 3,
			border: true,
			multiSelect: true,
			scroll: true,
			columns: [
				{
					header: _('Component'),
					sortable: false,
					dataIndex: 'co',
					flex: 1
	       		},{
					header: _('Resource'),
					sortable: false,
					dataIndex: 're',
					flex: 1
	       		},{
					header: _('Metric'),
					sortable: false,
					dataIndex: 'me',
					flex: 1
	       		}
			],
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					//enableDrag: false,
					copy: false,
					dragGroup: 'search_grid_DNDGroup',
					dropGroup: 'search_grid_DNDGroup'
				}
			}
		});

		//---------------------build menu------------------------
		this.clearAllButton = Ext.create('Ext.Action', {
							iconCls: 'icon-delete',
							text: _('Clear all'),
							action: 'clear'
						});

		this.deleteButton = Ext.create('Ext.Action', {
							iconCls: 'icon-delete',
							text: _('Delete selected'),
							action: 'delete'
						});

		this.contextMenu = Ext.create('Ext.menu.Menu', {
						items: [this.deleteButton, this.clearAllButton]
					});
	},

	bind_event: function() {
		log.debug('Binding events', this.logAuthor);

		//---------------------Meta inventory----------------------
		this.meta_grid.on('itemdblclick', function(view, record) {
			this.select_meta(record);
		},this);

		//----------------------event selected metric----------------
		this.selected_grid.on('itemdblclick', function(view,record) {
			this.selected_store.remove(record);
		}, this);

		//----------------------drop function--------------------
		this.selected_grid.getView().on('beforedrop', function(html_node,data,model,dropPosition,dropFunction,eOpts) {
			//only do action if is not reorder
			if (data.view.id != this.selected_grid.getView().id) {
				var records = data.records;
				for (var i in records)
					this.select_meta(records[i]);

				event.cancel = true;
				event.dropStatus = true;

				return false;
			}
		},this);

		//-------------------------Menu option---------------------
		this.selected_grid.on('itemcontextmenu', this.open_menu, this);
		this.clearAllButton.setHandler(function() {this.selected_store.removeAll()},this);
		this.deleteButton.setHandler(this.deleteSelected, this);
	},

	fetch_metrics: function(record) {
		log.debug('Fetch metrics', this.logAuthor);

		var metric_array = [];
		var metrics = record.get('metrics');
		var node = record.get('node');
		var dn = record.get('dn');

		for (var i in metrics)
			metric_array.push({'node': node, 'metric': metrics[i].dn, 'dn': dn});

		return metric_array.sort(this.sort_by_metric);
	},
	
	sort_by_metric: function(a,b){
		a = a.metric;
		b = b.metric;
		if(a == b)
			return 0
		if(a > b)
			return 1
		else
			return -1
	},

	select_meta: function(record) {
		var _id = record.get('_id')
		log.debug('Select Meta '+_id , this.logAuthor);
		if (! this.selected_store.getById(_id))
			this.selected_store.add(record.copy());
		else
			log.debug(' + Already selected' , this.logAuthor);	
	},

	open_menu: function(view, rec, node, index, e) {
		e.preventDefault();
		//don't auto select if multi selecting
		var selection = this.selected_grid.getSelectionModel().getSelection();
		if (selection.length < 2)
			view.select(rec);

		this.contextMenu.showAt(e.getXY());
		return false;
    },

    deleteSelected: function() {
		log.debug('delete selected metrics', this.logAuthor);
		var selection = this.selected_grid.getSelectionModel().getSelection();
		for (var i in selection)
			this.selected_store.remove(selection[i]);
	},

	getValue: function() {
		log.debug('Write values', this.logAuthor);
		var output = [];
		var nodes = {};
		this.selected_store.each(function(record) {
			var _id = record.get('id')
			var component = record.get('co')
			var resource = record.get('re')
			var metric = record.get('me');
			
			var source_type = 'component';
			if (resource)
				source_type = 'resource';

			if (source_type == 'resource')
				output.push({'id': _id, 'metrics': [metric], 'resource': resource, 'component': component, 'source_type': source_type});
			else
				output.push({'id': _id, 'metrics': [metric], 'component': component, 'source_type': source_type});
		});
		log.dump(output)
		return output;
	},

	setValue: function(data) {
		log.debug('Load values', this.logAuthor);
		for (var i in data){
			config = {
				id: data[i].id,
				co: data[i].component,
				re: data[i].resource,
				me: data[i].metrics
			}
			var record = Ext.create('Meta',config)
			this.selected_store.add(record);
		}
	}

});

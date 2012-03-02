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
	extend: 'Ext.panel.Panel',
	
	alias: 'widget.cinventory',
	
	border: false,
	
	metrics: true,
	multiSelect: true,
	
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		var default_layout = { type: 'hbox', align: 'stretch'}
		var default_defaults = { padding: 5 }
		
		this.items = this.buildView();
		
		if (! this.multiSelect){
			default_layout.type = 'vbox'
		}
		
		//HACK: for test in widget, wrap in container
		if (this.height){
			log.debug(' + Widget mode', this.logAuthor)
			this.items = {xtype: 'container', items: this.items, layout: default_layout, defaults: default_defaults}
			this.layout = 'fit'
		}else{
			this.layout = default_layout
			this.defaults = default_defaults
		}
		
		this.callParent(arguments);
	},

	buildView: function(){
		log.debug(' + Build view ...', this.logAuthor)
		
		var items = []
		
		// Configuration
		var model = Ext.ModelManager.getModel('canopsis.model.event');
		
		this.columns = [{
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
		
		//////// Selection GRID
		log.debug(' + Selection grid', this.logAuthor)
		
		this.selection_render =  function(value, p, record){
			var node = ''
			if (record.data.resource){
				node = Ext.String.format('<b>{0}</b><br>&nbsp;&nbsp;{1}', record.data.component,record.data.resource );
			}else{
				node = Ext.String.format('<b>{0}</b>', record.data.component );
			}
			return node
		}
		
		this.selection_render_metrics = function(perf_data, p, record){
			if (perf_data) {
				var output = ''
								
				for (var name in perf_data){
					metric = perf_data[name]
					
					var checked = 'checked'
					var state = this.get_metric(record.data.id, name)
					if (! state){ checked ='' }
					
					output += Ext.String.format(
						'<input type="checkbox" value="{0}" onclick="Ext.getCmp(\'{1}\').check_metric(\'{2}\',\'{3}\');" {4}> {5}<br>',
						name,
						this.id,
						record.data.id,
						name,
						checked,
						name
					);
				}
				return output
			}
		}
		
		this.selection_store = Ext.create('Ext.data.Store', {
				model: model,
		});
		
		// If metric mode
		var columns_metrics = {}
		if (this.metrics){
			columns_metrics = {
					sortable: false,
					dataIndex: 'perf_data_array',
					flex: 1,
					renderer: this.selection_render_metrics,
				}
		}
		
		var selection_height = undefined
		var selection_flex = 1
		if (! this.multiSelect){
			selection_flex = undefined
			selection_height = 130
		}
		
		this.selection_grid = Ext.create('canopsis.lib.view.cgrid', {
			title: _("Selection"),
			multiSelect: this.multiSelect,
			opt_bar: false,
			border: true,
			opt_paging: false,
			flex : selection_flex,
			height: selection_height,
			store: this.selection_store,
			hideHeaders: true,
			autoScroll: true,
			columns: [
				{
					header: '',
					width: 25,
					sortable: false,
					dataIndex: 'source_type',
					renderer: rdr_source_type
	       		},{
					sortable: false,
					dataIndex: 'id',
					flex: 2,
					renderer: this.selection_render
	       		}, columns_metrics
			],
			
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					enableDrag: false,
					dropGroup: 'search_grid_DNDGroup'
				},
			},
			
			// keep checked metrics
			metrics: {},
			init_metric: function(node, metric) {
				if (this.metrics[node] == undefined){
					this.metrics[node] = {}
				}
				
				if (this.metrics[node][metric] == undefined){
					this.metrics[node][metric] = true
				}
			},
			
			check_metric: function(node, metric, check) {
				
				this.init_metric(node, metric)
				
				if (check == undefined){
					//toggle
					check = ! this.metrics[node][metric]
				}
				this.metrics[node][metric] = check
				
				return check
			},
			
			get_metric: function(node, metric) {
				this.init_metric(node, metric)
				return this.metrics[node][metric]
			}
		});
		
		//////// Search GRID
		log.debug(' + Search grid', this.logAuthor)
		this.search_store = Ext.create('canopsis.lib.store.cstore', {
				model: model,
				pageSize: 15,
				proxy: {
					type: 'rest',
					url: '/rest/events/event',
					reader: {
						type: 'json',
						root: 'data',
						totalProperty  : 'total',
						successProperty: 'success'
					},
				},
				
				autoLoad: true
		})
		
		this.search_grid = Ext.create('canopsis.lib.view.cgrid', {
			multiSelect: this.multiSelect,
			opt_bar: true,
			opt_bar_search: true,
			opt_bar_add: false,
			opt_bar_duplicate: false,
			opt_bar_reload: true,
			opt_bar_delete: false,			
			opt_bar_search_field: ['_id' ],
			border: true,
			opt_paging: true,
			multiSelect: this.multiSelect,
			flex : 1,
			store: this.search_store,
			columns: this.columns,
			viewConfig: {
				copy : true,
				plugins: {
					ptype: 'gridviewdragdrop',
					enableDrop: false,
					dragGroup: 'search_grid_DNDGroup',
				},
			},
		});
		
		//////// Bind cgrid controller on search grid
		this.search_ctrl = Ext.create('canopsis.lib.controller.cgrid');
		
		this.on('afterrender', function() {
			this.search_ctrl._bindGridEvents(this.search_grid)	
		}, this);
		
		//////// Bind events
		log.debug(' + Bind events', this.logAuthor)
		
		this.selection_grid.on('itemdblclick',function(grid, record, item, index){
			this.selection_store.removeAt(index)
			this.selection_grid.metrics[record.data.id] = undefined
		}, this);

		this.search_grid.on('itemdblclick',function(grid, record, item, index){
			this.addRecord(record)
		}, this);

		this.selection_grid.getView().on('beforedrop', function(event, data, dropRec, dropPosition) {
			var records = data.records
			for (var i in records){
				var record = records[i]
				this.addRecord(record)
			}
			
			event.cancel = true;
			event.dropStatus = true;
			
			
			return false
		}, this);
		
		//////// Push items
		log.debug(' + Set items', this.logAuthor)
		items.push(this.search_grid)
		items.push(this.selection_grid)
		
		return items
	},
	
	addRecord : function(record, index){		
		if (this.selection_store.find('id', record.data.id) == -1 ){
			
			if (! this.multiSelect){
				this.selection_store.removeAll()
			}
			
			if (index != undefined){
				this.selection_store.insert(index, record.data)
			}else{
				this.selection_store.add(record.data)
			}
		}else{
			log.debug(record.data.id + " already selected", this.logAuthor)
		}
	},

	// GetValue for wizard ...
	getValue : function(){
		var dump = []
		var me = this
		
		this.selection_store.each(function(record){
			var id = record.data.id
			
			var metrics = []
			
			if (me.metrics) {
				var metrics_checked = me.selection_grid.metrics[id]
				var nb_metric = 0
				
				for (var metric in metrics_checked){
					if (metrics_checked[metric]){
						metrics.push(metric)
					}
					nb_metric += 1
				}
				
				//check if all metrics are checked
				if (metrics.length == nb_metric){
					metrics = [ "<all>" ]
				}
			}
			
			var rdump = {
				id: id,
				component: record.data.component,
				perf_data_array: record.data.perf_data_array,
				resource: record.data.resource,
				source_type: record.data.source_type,
				metrics: metrics,
			}
			dump.push(rdump)
		});
		
		log.debug("getValue Dump:", this.logAuthor)
		log.dump(dump)
		
		return dump
	},

	setValue : function(data){
		log.debug("setValue Data:", this.logAuthor)
		log.dump(data)

		for (var i in data){
			var rdata = data[i]
			// uncheck all metrics
			log.debug(" + Uncheck all metrics", this.logAuthor)
			for (var metric in rdata.perf_data_array)
					this.selection_grid.check_metric(rdata.id, metric , false)
	
			// if '<all>' check all metrics
			if (rdata.metrics){
				if (rdata.metrics[0] == '<all>'){
					log.debug(" + Check all metrics", this.logAuthor)
					for (var metric in rdata.perf_data_array)
						this.selection_grid.check_metric(rdata.id, metric , true)
				}else{
					for (var j in rdata.metrics){
						var metric = rdata.metrics[j]
						log.debug(" + Check '"+metric+"'", this.logAuthor)
						this.selection_grid.check_metric(rdata.id, metric, true)
					}
				}
			}
			
			this.addRecord({data: rdata})
		}
	},
	
	beforeDestroy : function() {
		this.search_ctrl.destroy()
		
		this.selection_grid.destroy()
		this.search_grid.destroy()
		
		Ext.grid.Panel.superclass.beforeDestroy.call(this);
		log.debug("Destroyed.", this.logAuthor)
	},

});

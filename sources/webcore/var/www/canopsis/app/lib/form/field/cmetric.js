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

Ext.define('canopsis.lib.form.field.cmetric' ,{
	extend: 'Ext.panel.Panel',
	
	alias: 'widget.cmetric',
	
	border: false,
	layout: {
        type: 'vbox',
        align: 'stretch'
    },
	//autoscroll : true,
	
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		this.build_stores()
		this.build_grids()
		this.bind_event()
		
		var config = {
			layout: {
				type: 'hbox',
				align: 'stretch'
			},
			flex:2
		}

		var container = Ext.create('Ext.container.Container',config)
		
		container.add([this.node_grid,this.metric_grid])
		
		this.items = [container,this.selected_grid]
		
		this.callParent(arguments);
	},
	
	build_stores : function(){
		log.debug('Build stores', this.logAuthor)
		var model = Ext.ModelManager.getModel('canopsis.model.Node');
		if(! model){
			Ext.define('Node', {
				extend: 'Ext.data.Model',
				fields: [
					{name: 'node', type: 'string'},
					{name: 'dn',  type: 'array'},
					{name: 'metrics'}
				]
			});
		}
		 
		var model = Ext.ModelManager.getModel('canopsis.model.Metric');
		if(! model){
			Ext.define('Metric', {
				extend: 'Ext.data.Model',
				fields: [
					{name: 'node', type: 'string'},
					{name: 'dn', type: 'array'},
					{name: 'metric',  type: 'string'}
				]
			});
		}
		
		this.node_store = Ext.create('canopsis.lib.store.cstore', {
				model: 'Node',
				proxy: {
					 type: 'ajax',
					 url: '/perfstore/get_all_nodes',

					 reader: {
						 type: 'json',
						 root: 'data'
					}	
				 },
				 autoLoad:true
		});
		
		this.metric_store = Ext.create('canopsis.lib.store.cstore', {
				model: 'Metric'
		});
		
		this.selected_store = Ext.create('canopsis.lib.store.cstore', {
				model: 'Metric'
		});
		
	},
	
	bind_event : function(){
		log.debug('Binding events', this.logAuthor)
		
		//---------------------event inventory----------------------
		if(this.node_grid){
				this.node_grid.on('itemclick',function(view,record){
						var metrics = this.fetch_metrics(record)
						this.metric_store.loadData(metrics)
					},this)
					
				this.node_grid.on('itemdblclick',function(view,record){
						var metrics = this.fetch_metrics(record)
						this.select_metrics(metrics)
					},this)
		}
		
		//--------------------event metric of node------------------
		if(this.metric_grid){
			this.metric_grid.on('itemdblclick',function(view,record){
							this.select_metrics([{node: record.get('node'), metric: record.get('metric'), dn: record.get('dn')}])
						},this)
		}
		
		//----------------------event selected metric----------------
		if(this.selected_grid){
			this.selected_grid.on('itemdblclick',function(view,record){
							view.store.remove(record)
						})
			
		}
		
		//----------------------drop function--------------------
		this.selected_grid.getView().on('beforedrop',function(html_node,data,model,dropPosition,dropFunction,eOpts){
			//only do action if is not reorder
			if(data.view.id != this.selected_grid.getView().id){
				var records = data.records;
				for (var i in records) {
					var record = records[i];
					
					if(record.get('metric')){
						//if the dd is a metric
						this.selected_store.add(record);
					}else{
						//if the dd is a node
						this.select_metrics(this.fetch_metrics(record))
					}
				}

				event.cancel = true;
				event.dropStatus = true;
				
				return false;
			}
		},this)
		
		//-------------------------Menu option---------------------
		this.selected_grid.on('itemcontextmenu', this.open_menu, this);
		this.clearAllButton.setHandler(function(){this.selected_store.removeAll()},this)
		this.deleteButton.setHandler(this.deleteSelected,this)
	},
	
	fetch_metrics: function(record){
		log.debug('Fetch metrics', this.logAuthor)

		var metric_array = []
		var metrics = record.get('metrics')
		var node = record.get('node')
		var dn = record.get('dn')
		
		for( var i in metrics)
			metric_array.push({'node':node,'metric':metrics[i].dn, 'dn': dn})
			
		return metric_array
	},
	
	select_metrics: function(metric_array){
		log.debug('Select metrics', this.logAuthor)
		var store = this.selected_store

		for(var i in metric_array){
			var metric = metric_array[i]
			
			//check if already in store
			var exist = store.findBy(
				function(record,id){
					if(metric.node == record.get('node'))
						if(metric.metric == record.get('metric'))
							return true
					return false				
				}
			,this)
			
			//if not, add it
			if(exist == -1)
				store.add(metric_array[i])
		}
	},
	
	renderer_dn: function(val){
		if (val.length > 1)
			return val[0] + " - " + val[1]
		else
			return val[0]
	},
	
	renderer_dn_component : function(val){
		return val[0]
	},
	
	renderer_dn_resource : function(val){
		if (val.length > 1)
			return val[1]
	},

	build_grids : function(){
		log.debug('Build grids', this.logAuthor)
		//-------------------------first grid--------------------
		this.node_grid = Ext.create('canopsis.lib.view.cgrid',{
			store:this.node_store,
			flex:2,
			margin:3,
			
			opt_menu_rights: false,
			opt_bar: true,
			opt_bar_search: true,
			opt_bar_add: false,
			opt_allow_edit: false,
			opt_bar_duplicate: false,
			opt_bar_reload: true,
			opt_bar_delete: false,
			opt_paging: true,
			opt_simple_search : true,

			border : true,
			
			columns: [
				{
					header: _('Component'),
					sortable: false,
					dataIndex: 'dn',
					renderer: this.renderer_dn_component,
					flex: 1
	       		},
	       		{
					header: _('Resource'),
					sortable: false,
					dataIndex: 'dn',
					renderer: this.renderer_dn_resource,
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
		})
		
		var search_ctrl = Ext.create('canopsis.lib.controller.cgrid');
		this.node_grid.on('afterrender',function(){
			search_ctrl._bindGridEvents(this.node_grid);
		},this)
		
		//------------------------second grid---------------------
		this.metric_grid = Ext.widget('grid',{
			store:this.metric_store,
			flex:1,
			margin:3,
			border:true,
			scroll: true,
			columns: [
				{
					header: 'Metrics',
					sortable: false,
					dataIndex: 'metric',
					flex:1
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
		})
		
		//------------------------third grid---------------------
		
		this.selected_grid = Ext.widget('grid',{
			store : this.selected_store,
			flex:1,
			margin:3,
			border:true,
			multiSelect:true,
			scroll: true,
			columns: [
				{
					header: _('Component'),
					sortable: false,
					dataIndex: 'dn',
					renderer: this.renderer_dn_component,
					flex: 1
	       		},
	       		{
					header: _('Resource'),
					sortable: false,
					dataIndex: 'dn',
					renderer: this.renderer_dn_resource,
					flex: 1
	       		},
	       		{
					header: 'Selected metrics',
					sortable: false,
					dataIndex: 'metric',
					flex:1
	       		}
			],
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					//enableDrag: false,
					copy:false,
					dragGroup: 'search_grid_DNDGroup',
					dropGroup: 'search_grid_DNDGroup'
				}
			}
		})
		
		//---------------------build menu------------------------
		this.clearAllButton = Ext.create('Ext.Action', {
							iconCls: 'icon-delete',
							text: _('Clear all'),
							action: 'clear'
						})

		this.deleteButton = Ext.create('Ext.Action', {
							iconCls: 'icon-delete',
							text: _('Delete selected'),
							action: 'delete'
						})

		this.contextMenu = Ext.create('Ext.menu.Menu', {
						items: [this.deleteButton,this.clearAllButton]
					});
	},
	
	open_menu : function(view, rec, node, index, e) {
		e.preventDefault()
		//don't auto select if multi selecting
		var selection = this.selected_grid.getSelectionModel().getSelection();
		if (selection.length < 2)
			view.select(rec);

		this.contextMenu.showAt(e.getXY());
		return false;
    },
    
    deleteSelected : function(){
		log.debug('delete selected metrics',this.logAuthor)
		var selection = this.selected_grid.getSelectionModel().getSelection();
		for(var i in selection)
			this.selected_store.remove(selection[i])
	},
	
	getValue : function(){
		log.debug('Write values',this.logAuthor)
		var output = []
		var nodes = {}
		this.selected_store.each(function(record) {
			
			var node = record.get('node')
			var dn = record.get('dn')
			var metric = record.get('metric')
			
			//check if resource
			if(dn.length > 1)
				var source_type = 'resource'
			else
				var source_type = 'component'
			
			if(source_type == 'resource')
				output.push({'id':node,'metrics':[metric],'resource': dn[1],'component': dn[0],'source_type':source_type, 'dn': dn})
			else
				output.push({'id':node,'metrics':[metric],'component': dn[0],'source_type':source_type, 'dn': dn})
		})

		return output
	},
	
	setValue : function(data){
		log.debug('Load values',this.logAuthor)
		for(var i in data){
			var node = data[i]
			for(var j in node.metrics){
				var metric = node.metrics[j]
				this.selected_store.add({'node':node.id,'metric':metric, 'dn': node.dn})
			}
		}
	},
	
})

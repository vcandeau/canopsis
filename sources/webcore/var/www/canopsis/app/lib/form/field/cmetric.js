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
	
	pageSize : 14,
	
	border: false,
	layout: {
        type: 'hbox',
        align: 'stretch'
    },
	//autoscroll : true,
	
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		this.build_stores()
		this.build_grids()
		this.bind_event()
		//this.add([this.node_grid,this.metric_grid,this.selected_grid])
		
		this.items = [this.node_grid,this.metric_grid,this.selected_grid]
		
		this.callParent(arguments);
	},
	
	build_stores : function(){
		
		var model = Ext.ModelManager.getModel('canopsis.model.Node');
		if(! model){
			Ext.define('Node', {
				extend: 'Ext.data.Model',
				fields: [
					{name: 'node', type: 'string'},
					{name: 'dn',  type: 'string'}
				]
			});
		}
		 
		var model = Ext.ModelManager.getModel('canopsis.model.Metric');
		if(! model){
			Ext.define('Metric', {
				extend: 'Ext.data.Model',
				fields: [
					{name: 'node', type: 'string'},
					{name: 'metric',  type: 'string'}
				]
			});
		}
		
		this.node_store = Ext.create('canopsis.lib.store.cstore', {
				model: 'Node',
				//pageSize: this.pageSize,
				proxy: {
					 type: 'ajax',
					 url: '/perfstore/get_all_nodes',
					// extraParams:{limit:this.pageSize},
					 reader: {
						 type: 'json',
						 root: 'data'
					}	
				 },
				 //autoLoad: {start: 0, limit: this.pageSize},
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
						this.fetch_metrics(record.get('node'))
					},this)
					
				this.node_grid.on('itemdblclick',function(view,record){
						this.select_metrics(record.get('node'))
					},this)
		}
		
		//--------------------event metric of node------------------
		if(this.metric_grid){
			this.metric_grid.on('itemdblclick',function(view,record){
							this.selected_store.add(record)
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
			var records = data.records;
			for (var i in records) {
				var record = records[i];
				
				if(record.get('metric')){
					this.selected_store.add(record);
				}else{
					var node = record.get('node');
					Ext.Ajax.request({
						url: '/perfstore/metrics/' + node,
						scope: this,
						success: function(response){
							var data = Ext.decode(response.responseText).data;
							if(data)
								this.selected_store.add(data)
						}
					});
				}
			}

			event.cancel = true;
			event.dropStatus = true;
			
			return false;
		},this)
		
	},
	
	fetch_metrics: function(_id){
		log.debug('Fetch metrics', this.logAuthor)
		Ext.Ajax.request({
			url: '/perfstore/metrics/' + _id,
			scope: this,
			success: function(response){
				var text = Ext.decode(response.responseText);
				var record_array = []
				for(var i in text.data){
					record_array.push(Ext.create('Metric',text.data[i]))
				}
				this.metric_store.loadData(record_array)
			}
		});
	},
	
	select_metrics: function(_id){
		log.debug('Select metrics', this.logAuthor)
		Ext.Ajax.request({
			url: '/perfstore/metrics/' + _id,
			scope: this,
			success: function(response){
				var text = Ext.decode(response.responseText);
				var record_array = []
				for(var i in text.data){
					record_array.push(Ext.create('Metric',text.data[i]))
				}
				this.selected_store.add(record_array)
			}
		});
	},

	build_grids : function(){
		//-------------------------first grid--------------------
		this.node_grid = Ext.create('canopsis.lib.view.cgrid',{
			store:this.node_store,
			flex:2,
			margin:3,
			
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
					header: 'Component/Ressource',
					sortable: false,
					dataIndex: 'dn',
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
			scroll: true,
			columns: [
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
					enableDrag: false,
					dropGroup: 'search_grid_DNDGroup'
				}
			}
		})
	},
	
	getValue : function(){
		var output = []
		var nodes = {}
		this.selected_store.each(function(record) {
			var node = record.get('node')
			var metric = record.get('metric')
			var node_exploded = node.split('.')
			
			//check if resource
			if(node_exploded[5])
				var source_type = 'resource'
			else
				var source_type = 'component'
			
			//regroup metric by nodes
			if (nodes[node]){
				nodes[node].metrics.push(metric)
			}else{
				if(source_type == 'resource')
					nodes[node] = {'id':node,'metrics':[metric],'resource':node_exploded[5],'component':node_exploded[4],'source_type':source_type}
				else
					nodes[node] = {'id':node,'metrics':[metric],'component':node_exploded[4],'source_type':source_type}
			}
		})
		
		//object to array
		for(var i in nodes)
			output.push(nodes[i])
		
		return output
	},
	
	setValue : function(data){
		log.debug('erfezregergsrgesrgregesrger')
		log.dump(data)
		
		for(var i in data){
			var node = data[i]
			for(var j in node.metrics){
				var metric = node.metrics[j]
				this.selected_store.add({'node':node.id,'metric':metric})
			}
		}
	},
	
})

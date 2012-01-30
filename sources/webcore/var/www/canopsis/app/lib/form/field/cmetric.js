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
	extend: 'Ext.grid.Panel',
	
	logAuthor: '[cmetric]',
	
	hideHeaders : true,
	
	columns : [{
					flex: 1,
					sortable: false,
					dataIndex: 'metric',
					stripeRows : true
	       		}],
	
	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		//TODO : create a real model file for this 
		if(!Ext.ModelManager.getModel('metric')){
			Ext.define('metric', {
				id : 'metric',
				extend: 'Ext.data.Model',
				fields: [
					{name: 'metric', type: 'string'},
				]
			});
		}
		
		this.store = Ext.create('Ext.data.Store', {
				model: 'metric',
				data : []
		});
		
		var addButton = Ext.create('Ext.Button', {
							iconCls: 'icon-add',
							text: _('Add')
						})
		
		this.tbar = [ _('Select Metrics'),'->',addButton]
		
		this.callParent(arguments);
		
		//binding addButton
		addButton.on('click',this.addButton,this)
	},
	
	addButton : function(){
		if(this.nodeId){
			this.createWindow()
		} else {
			global.notify.notify(_('Missing'),_('you must choose a component/resource in the previous panel'))
		}
	},
	
	setNodeId : function(nodeId){
		log.debug('Setting NodeId', this.logAuthor)
		this.nodeId = nodeId
		this.clearStore()
		this.CreateStores()
	},
	
	clearStore : function(){
		this.store.removeAll()
	},
	
	CreateStores : function(){
		if(this.metricFetched){
			this.metricFetched.proxy.url = '/perfstore/metrics/' + this.nodeId
			this.metricFetched.load()
		}else{
			this.metricFetched = Ext.create('Ext.data.Store', {
					model: 'metric',
					autoLoad : true,
					proxy : {
						type: 'rest',
						url: '/perfstore/metrics/' + this.nodeId,
						reader: {
							type: 'json',
							root: 'data',
							totalProperty  : 'total',
							successProperty: 'success'
						},
					}
			});
		}
		
	},
	
	CreateSelectionPanel : function(){
		//-----------------------create buttons-------------------
		var selectAllButton = Ext.create('Ext.button.Button',{
			text : _('select All'),
		})
		selectAllButton.on('click', this.selectAllMetric,this)
		
		var finishButton = Ext.create('Ext.button.Button',{
			text : _('finish'),
		})
		finishButton.on('click', this.finishButton,this)
		
		var clearButton = Ext.create('Ext.button.Button',{
			text : _('clear'),
		})
		clearButton.on('click', function(){this.clearStore();this.metricFetched.load()},this)
		
		//-----------------------create panels------------------
		
		this.gridPanel1 = Ext.create('Ext.grid.Panel',{
			store: this.store,
			title : _('Selected metrics'),
			hideHeaders : true,
			//border : false,
			flex : 1,
			margins          : '0 2 0 0',
			stripeRows : true,
			bbar : [clearButton,selectAllButton,'->',finishButton],
			columns : [{
					flex: 1,
					sortable: false,
					dataIndex: 'metric',
					
	       		}],
	       		viewConfig: {
					plugins: {
 						ptype: 'gridviewdragdrop',
						dragGroup: 'firstMetricGridDDGroup',
						dropGroup: 'secondMetricGridDDGroup'
					},
				}
		})
		
		this.gridPanel2 = Ext.create('Ext.grid.Panel',{
			store: this.metricFetched,
			title : _('Available metrics'),
			hideHeaders : true,
			//border : false,
			flex : 1,
			margins : '0 0 0 3',
			stripeRows : true,
			columns : [{
					flex: 1,
					sortable: false,
					dataIndex: 'metric',
					
	       		}],
			viewConfig: {
				plugins: {
					ptype: 'gridviewdragdrop',
					dragGroup: 'secondMetricGridDDGroup',
					dropGroup: 'firstMetricGridDDGroup'
				},
			}
		})
		
		this.selectionPanel = Ext.create('Ext.panel.Panel',{
				//width: 700,
				title : _('choose metrics'),
				minWidth: 300,
				height: 400,
				border : false,
				//bodyStyle: 'padding: 5px;',
				layout: {
					type: 'hbox',
					align: 'stretch',
					//padding: 5,
				},
				items : [this.gridPanel1,this.gridPanel2]
		})
		
	},
	
	selectAllMetric : function(){
		this.store.add(this.metricFetched.getRange())
		this.metricFetched.removeAll()
	},
	
	createWindow: function(){
		this.CreateSelectionPanel()
		var tabbedPanel = Ext.create('Ext.tab.Panel',{
			layout: 'fit',
			border: false,
		})
		
		this.metricWindow = Ext.create('Ext.window.Window' ,{
			title: _('Select metrics'),
			closable: true,
			closeAction: 'destroy',
			width: 600,
			minWidth: 350,
			height: 350,
			layout: 'fit',
			bodyStyle: 'padding: 5px;',

			items : [tabbedPanel],
		})
		
		tabbedPanel.add(this.selectionPanel)
		this.metricWindow.show()
		tabbedPanel.setActiveTab(0)
	},
	
	finishButton : function(){
		log.debug('clicked on finishbutton', this.logAuthor)
		this.metricWindow.close()
	},
	
	getValue : function(){
		//formating value to output string array with metrics
		var output = []
		this.store.each(function(record){
				output.push(record.get('metric'))
			},this)
		return output
	},
	
	setValue : function(data){
		var metricModule = Ext.ModelManager.getModel('metric')
		var metric = []
		for( i in data){
			metric.push(Ext.ClassManager.instantiate(metricModule, {metric : data[i]} ))
		}
		if(metric){
			this.store.add(metric)
		}
	}
	
});

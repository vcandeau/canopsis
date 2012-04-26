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
Ext.define('canopsis.controller.MetricNavigation', {
	extend: 'Ext.app.Controller',

	stores: [],
	models: [],

	logAuthor : '[controller][MetricNavigation]',

	views: ['MetricNavigation.MetricNavigation'],
	
	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.control({
			'MetricNavigation' : {
				afterrender : this._bindMetricNavigation
			}
		})
		
		this.callParent(arguments);
	},
	
	_bindMetricNavigation : function(panel){
		log.debug('Binding events', this.logAuthor)
		this.tabPanel = panel.tabPanel
		this.renderPanel =  panel.renderPanel
		this.metricTab = panel.metricTab
		this.renderContent = panel.renderContent
		
		//-------------------------Button bindings------------------
		panel.buttonCancel.on('click',this._buttonCancel,this)
		panel.buttonDisplay.on('click',this._buttonDisplay,this)
		//this.tabPanel.on('collapse'
		//this.tabPanel.on('expand'
		
	},
	
	_buttonCancel : function(){
		log.debug('Click on cancel button', this.logAuthor)
		tab = Ext.getCmp('main-tabs').getActiveTab()
		tab.close()
	},
	
	_buttonDisplay:function(){
		log.debug('Click on display button', this.logAuthor)
		metrics = this.metricTab.getValue()
		//log.dump(metrics)
		for(var i = 0; i < metrics.length; i++){
			log.dump(metrics[i])
			this._addGraph([metrics[i]])
		}
	},
	
	_addGraph : function(nodes){
		log.dump(nodes)
		var config = {
			nodes:nodes,
			//time_window:604800
			width:'40%',
			height:200,
		}
		var graph = Ext.widget('line_graph',config)
		//var panel = Ext.create('Ext.container.Container',{width:300,height:200,items:[graph]})
		//this.renderPanel.add(panel)
		this.renderContent.add(graph)
	}
	
})

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

Ext.define('widgets.weather.weather' , {
	extend: 'canopsis.lib.view.cwidget',

	alias: 'widget.weather',
	logAuthor: '[widget][weather]',
	border: false,
	
	cls: 'widget-weather',

	wcontainer_autoScroll: true,
	wcontainer_layout: 'anchor',

	selector_record : undefined,
	sla_id: undefined,
	
	//brick options
	iconSet : '01',
	defaultHeight : undefined,
	defaultPadding : undefined,
	defaultMargin : undefined,
	state_as_icon_value : false,
	bg_impair_color: undefined,
	bg_pair_color: "#FFFFFF",
	
	initComponent: function() {
		if(this.exportMode)
			this.wcontainer_autoScroll = false
		this.callParent(arguments);
	},
	
	afterContainerRender: function() {
		if (this.nodeId) 
			this.getNodes()
		this.callParent(arguments);
	},
	
	doRefresh: function(from, to) {
		log.debug('Do refresh',this.logAuthor)
		if (this.nodeId){
			if(!this.reportMode)
				this.getNodes()
			else
				this.getPastNodes(from,to)
		}
	},
	
	getNodes : function(){
		Ext.Ajax.request({
			url: this.uri,
			scope: this,
			method: 'GET',
			params: {ids:Ext.encode(this.nodeId)},
			success: function(response) {
				this.nodes = Ext.JSON.decode(response.responseText).data;
				this.populate()
			},
			failure: function(result, request) {
				log.error('Impossible to get Node', this.logAuthor);
				global.notify.notify(_('Issue'), _("The selected selector can't be found"),'info');
			}
		});
	},
	
	getPastNodes : function(from,to){
		log.debug(' + Request data from: ' + from + ' to: ' + to,this.logAuthor)
		
		//--------------------Prepare post params-----------------
		var post_params = []
		for(var i in this.nodes){
			var node = {id:this.nodes[i]._id}
			
			if(this.nodes[i].event_type == 'selector')
				node.metrics = ['cps_state']
			else
				node.metrics = ['cps_pct_by_state_0']
				
			post_params.push(node)
		}
		
		//-------------------------send request--------------------
		Ext.Ajax.request({
			url: '/perfstore/values/' + from +'/'+ to ,
			params: {'nodes':Ext.JSON.encode(post_params)},
			scope: this,
			success: function(response) {
				var data = Ext.JSON.decode(response.responseText);
				data = data.data;
				this.report(data)
			},
			failure: function(result, request) {
				log.error('Impossible to get sla informations on the given time period', this.logAuthor);
			}
		});
	},
	
	populate: function(){
		log.debug('Populate widget', this.logAuthor)
		this.wcontainer.removeAll()
		
		//-------------------define base config-------------------
		var base_config = {
				iconSet: this.iconSet,
				state_as_icon_value: this.state_as_icon_value,
			}
			
		if(this.defaultPadding)
			base_config.padding = this.defaultPadding
			
		if(this.defaultMargin)
			base_config.margin = this.defaultMargin
		
		if(this.nodes.length == 1){
			base_config.anchor = '100% 100%'
		} else {
			if(this.defaultHeight)
				base_config.height = parseInt(this.defaultHeight,10)
			base_config.anchor = '100%'
		}

		//------------------brick creation---------------------
		for(var i in this.nodes){
			var node = this.nodes[i]
			
			var config = {
				nodeId: node._id,
				data : node,
				brick_number: i,
			}
			
			if((i % 2) == 0)
				config.bg_color = this.bg_pair_color
			else
				config.bg_color = this.bg_impair_color

			var meteo = Ext.create('widgets.weather.brick',Ext.Object.merge(base_config, config) )
			this.wcontainer.insert(0, meteo);		
		}

	},
	
	report : function(data){
		log.debug(' + Enter report function', this.logAuthor)
		bricks = this.wcontainer.items.items
		
		Ext.Array.each(bricks,function(brick){
			var new_values = undefined
			
			for(var i in data)
				if(data[i].node == brick.nodeId)
					new_values = data[i]
			
			if(new_values)
				brick.buildReport(new_values)
			else
				brick.buildEmpty()
		},this)
	},

});

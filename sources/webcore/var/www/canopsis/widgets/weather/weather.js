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
	bg_pair_color: undefined,
	
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
		if (this.nodeId) 
			this.getNodes()
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
				config.bg_color = {'background-color': this.bg_pair_color}
			else
				config.bg_color = {'background-color': this.bg_impair_color}

			var meteo = Ext.create('widgets.weather.brick',Ext.Object.merge(base_config, config) )
			this.wcontainer.insert(0, meteo);		
		}
	
		
	
	},
	/*
	populate: function(datas){
		log.debug('Populate widget', this.logAuthor)
		this.wcontainer.removeAll()

		if(!Ext.isArray(datas))
			datas = [datas]

		for (var i in datas){
			var data = datas[i]
			var sla_id = 'sla.engine.sla.resource.' + data.component + '.sla'

			var config = {
				brick_number: i,
				sla_id: sla_id,
				iconSet: this.iconSet,
				use_sla: this.use_sla,
				selector: data,
				state_as_icon_value: this.state_as_icon_value,
				bg_impair_color: this.bg_impair_color,
				bg_pair_color: this.bg_pair_color,
				component_name: data.component
			}
			
			if(datas.length == 1){
				config.anchor = '100% 100%'
			} else {
				if(this.defaultHeight)
					config.height = parseInt(this.defaultHeight,10)
				config.anchor = '100%'
			}
			
			if(this.defaultPadding)
				config.padding = this.defaultPadding
			
			if(this.defaultMargin)
				config.margin = this.defaultMargin
			
			var meteo = Ext.create('widgets.weather.brick', config)
			this.wcontainer.insert(0, meteo);
		}
	},
	*/
	
});

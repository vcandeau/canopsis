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

	selector_record: undefined,
	sla_id: undefined,

	//brick options
	iconSet: '01',
	icon_on_left: false,
	defaultHeight: undefined,
	defaultPadding: undefined,
	defaultMargin: undefined,
	state_as_icon_value: false,
	bg_impair_color: undefined,
	bg_pair_color: '#FFFFFF',

	base_config: undefined,

	initComponent: function() {
		log.debug('Initialize weather widget', this.logAuthor);
		if (this.exportMode)
			this.wcontainer_autoScroll = false;
		this.callParent(arguments);
	},

	afterContainerRender: function() {
		this.configure();
		//if(this.exportingMode){

		if (this.nodeId)
			this.getNodes();


		this.callParent(arguments);
	},

	doRefresh: function(from, to) {
		log.debug('Do refresh', this.logAuthor);
		if (this.nodeId) {
			if (!this.reportMode)
				this.getNodes();
			else
				this.getPastNodes(from, to);
		}
	},

	getNodes: function() {
		log.debug('+ Get nodes', this.logAuthor)
		Ext.Ajax.request({
			url: this.uri,
			scope: this,
			method: 'GET',
			params: {ids: Ext.encode(this.nodeId)},
			success: function(response) {
				var nodes = Ext.JSON.decode(response.responseText).data;
				this.nodes = nodes
				this.populate(nodes);
			},
			failure: function(result, request) {
				log.error('Impossible to get Node', this.logAuthor);
				global.notify.notify(_('Issue'), _("The selected selector can't be found"), 'info');
			}
		});
	},

	getPastNodes: function(from,to) {
		log.debug(' + Request data from: ' + from + ' to: ' + to, this.logAuthor);

		//--------------------Prepare post params-----------------
		var post_params = [];
		for (var i in this.nodes) {
			var node = {id: this.nodes[i]._id};

			if (this.nodes[i].event_type == 'selector')
				node.metrics = ['cps_state'];
			else
				node.metrics = ['cps_pct_by_state_0'];

			post_params.push(node);
		}

		//-------------------------send request--------------------
		Ext.Ajax.request({
			url: '/perfstore/values/' + from + '/' + to,
			params: {'nodes': Ext.JSON.encode(post_params)},
			scope: this,
			success: function(response) {
				var data = Ext.JSON.decode(response.responseText);
				data = data.data;
				this.report(data);
			},
			failure: function(result, request) {
				log.error('Impossible to get sla informations on the given time period', this.logAuthor);
			}
		});
	},

	configure: function() {
		//-------------------define base config-------------------
		this.base_config = {
				iconSet: this.iconSet,
				state_as_icon_value: this.state_as_icon_value,
				icon_on_left: this.icon_on_left,
				exportMode: this.exportMode
			};

		if (this.defaultPadding)
			this.base_config.padding = this.defaultPadding;

		if (this.defaultMargin)
			this.base_config.margin = this.defaultMargin;

		if (this.nodes.length == 1) {
			this.base_config.anchor = '100% 100%';
		} else {
			if (this.defaultHeight)
				this.base_config.height = parseInt(this.defaultHeight, 10);
			this.base_config.anchor = '100%';
		}

	},

	populate: function(data) {
		log.debug('  +  Populate widget with '+ data.length + ' elements.', this.logAuthor);
		this.wcontainer.removeAll();
		var debug_loop_count = 0

		for (var i in data) {
			var node = data[i];
			log.debug('   +    Build brick for node ' + node._id,this.logAuthor)

			var config = {
				nodeId: node._id,
				data: node,
				brick_number: i
			};

			if ((i % 2) == 0)
				config.bg_color = this.bg_pair_color;
			else
				config.bg_color = this.bg_impair_color;

			var meteo = Ext.create('widgets.weather.brick', Ext.Object.merge(config, this.base_config));
			this.wcontainer.insert(0, meteo);
			debug_loop_count += 1;
		}
		
		log.debug('  +  Finished to populate weather widget with ' + debug_loop_count + ' elements', this.logAuthor);

		if (this.exportMode) {
			log.debug(' + Exporting mode enable, fetch data', this.logAuthor);
			this.getPastNodes(export_from, export_to);
		}
	},

	report: function(data) {
		log.debug(' + Enter report function', this.logAuthor);
		bricks = this.wcontainer.items.items;

		Ext.Array.each(bricks, function(brick) {
			var new_values = undefined;

			for (var i in data)
				if (data[i].node == brick.nodeId)
					new_values = data[i];

			if (new_values) {
				log.debug(' + New values for ' + brick.event_type + ' ' + brick.component, this.logAuthor);
				brick.buildReport(new_values);
			}else {
				log.debug(' + No data recieved for ' + brick.event_type + ' ' + brick.component, this.logAuthor);
				brick.buildEmpty();
			}
		},this);
	}

});

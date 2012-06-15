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

Ext.define('widgets.stream.stream' ,{
	extend: 'canopsis.lib.view.cwidget',
	
	alias : 'widget.stream',
	logAuthor: '[widget][stream]',
	
	cls: "widget-stream",
	
	max: 10,
	max_comment: 5,
	
	queue: [],
	
	last_push: 0,
	burst_counter: 0,
	
	burst_interval: 500, //ms
	burst_threshold: 2, //nb events
	
	autoScroll: true,
	
	wcontainer_layout: 'anchor',
	
	showToolbar: true,
	
	amqp_queue: "alerts",
	hard_state_only: true,

	initComponent: function() {
		this.nodeId = false	
		this.refreshInterval = 5;
		
		if (this.showToolbar){
			this.tbar = Ext.create('Ext.toolbar.Toolbar', {
					//baseCls: 'x-panel-header',
					//height: 27,
					items: [
						{
							xtype: 'tbtext',
							text: this.title,
							//baseCls: "x-panel-header-text-container"
						},
						'->',{
							iconCls:'icon-control-repeat',
							tooltip: _('Clear tray'),
							scope   : this,
							handler : function() {
								this.wcontainer.removeAll(true)	
							}
						},{
							iconCls:'icon-control-pause',
							tooltip: _('Pause stream'),
							scope   : this,
							enableToggle: true,
							toggleHandler : function(button, state) {
								if (state){
									button.setIconCls('icon-control-play')
									this.unsubscribe()
								}else{
									button.setIconCls('icon-control-pause')
									this.subscribe()
								}
							}
						}
					]
				});
		}
		
		this.title = undefined
			
		this.callParent(arguments);
	},
	
	afterContainerRender: function(){
		
		//Debug
		/*var event1_raw = {'id': 'collectd.collectd2event.check.resource.wpain-laptop.canopsis_mongodb1', 'output': 'aaa aa  aaaaa aa aa  aaa fff  ff f  ffffffff zedzedzaedazedazedazedazedazedazedazedaze zeadazed aezdazed aezdazed azedazed azedazedazd', 'connector': 'collectd', 'domain': null, 'resource':  parseInt(new Date().getTime() / 1000), 'event_type': 'check', 'timestamp': 1338558740, 'component': 'wpain-laptop', 'state_type': 1, 'source_type': 'resource', 'state': 0, 'connector_name': 'collectd2event', 'address': null, 'perf_data_array': [{'min': null, 'max': null, 'metric': 'files_size', 'value': 0, 'type': 'GAUGE', 'unit': null}], 'perf_data': null}
		var event = Ext.create('widgets.stream.event', {raw: event1_raw, stream: this})		
		this.add_events([event])
		*/
		
		// Get history
		var filter = '{"event_type": {"$ne": "comment"}}'
		if (this.hard_state_only)
			filter = '{ "$and": [{"state_type": 1 }, '+filter+']}'
		
		Ext.Ajax.request({
			url: "/rest/events_log",
			scope: this,
			method: 'GET', 
			params: {
				limit: this.max,
				filter: filter,
				sort: '[{"property":"timestamp", "direction":"DESC"}]'
			},
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				data = data.data
				
				if (data.length > 0){
					for (var i in data)
						data[i] = Ext.create('widgets.stream.event', {id: this.get_event_id(data[i]), raw: data[i], stream: this})
					
					this.add_events(data);
				}
				
				if (! this.reportMode )
					this.subscribe();
					
				this.ready();
			},
		});
		
	},
	
	subscribe: function(){
		// Subscribe to AMQP channel
		global.websocketCtrl.subscribe('amqp', this.amqp_queue, this.on_event, this);
	},
	
	unsubscribe: function(){
		// Unsubscribe
		global.websocketCtrl.unsubscribe('amqp', this.amqp_queue, this);
	},
	
	publish_comment: function(event_id, raw, message, orievent){
		log.debug(event_id+" -> "+message, this.logAuthor)
		
		var event_raw = {
				'connector_name': 'widget-stream',
				'source_type': raw.source_type,
				'event_type': 'comment',
				'component': raw.component,
				'resource':  raw.resource,
				'output': message,
				'referer': event_id,
				'author': global.account.firstname + " " + global.account.lastname,
				'state': 0,
				'state_type': 1,
			}
		
		global.websocketCtrl.publish('amqp', 'events', event_raw)
	},

	doRefresh: function (){		
		this.process_queue()

		//refresh time
		for (var i=0; i<this.wcontainer.items.length; i++){
			var event = this.wcontainer.getComponent(i)
			if (event)
				event.update_time()
		}
			
	},
	
	TabOnShow: function(){
		this.doLayout();
		this.purge_queue();
		this.callParent();
	},
	
	process_queue: function(){
		// Check burst
		if ( ! this.in_burst())
			this.purge_queue();
	},
	
	purge_queue: function(){
		if (this.queue.length){
			log.debug("Purge event's queue ("+this.queue.length+")", this.logAuthor)
			// Back to normal, purge queue
			this.add_events(this.queue)
			this.queue = []
		}
	},
	
	in_burst: function(){
		if ((this.last_push + this.burst_interval) > new Date().getTime()){
			if (this.burst_counter < this.burst_threshold){
				this.burst_counter += 1;
				log.debug("Burst counter: "+this.burst_counter, this.logAuthor)
				return false;
			}else{
				return true;
			}
		}else{
			this.burst_counter = 0
			return false;
		}
	},
	
	get_event_id: function(raw){
		var id = undefined
		if (raw['event_id'])
			id = raw['event_id']
		id += "." + raw['timestamp']
		
		return id
	},
	
	on_event: function(raw, rk){
		
		//Only hard state
		if (raw.state_type == 0 && this.hard_state_only)
			return

		var id = this.get_event_id(raw)
		
		var event = Ext.create('widgets.stream.event', {id: id, raw: raw, stream: this})
		
		if (event.raw.event_type == 'comment'){
			var to_event = this.wcontainer.getComponent(this.id + "." + event.raw.referer)
			if (to_event){
				log.debug("Add comment for "+ event.raw.referer,this.logAuthor)
				to_event.comment(event)
				if (this.isVisible())
					to_event.show_comments()
			}else{
				log.debug("Impossible to find event '"+event.raw.referer+"' from container, maybe not displayed ?",this.logAuthor)
			}
				
		}else{
			// Detect Burst or hidden
			if (this.in_burst() || this.isHidden()){
				this.queue.push(event)
				
				//Clean queue
				if (this.queue.length > this.max){
					var event = this.queue.shift()
					event.destroy();
					delete event;
				}
			}else{
				//Display event
				this.process_queue()
				this.add_events([ event ])
			}
			
			this.last_push = new Date().getTime();
		}
	},
	
	add_events: function(events){		
		if (events.length >= this.max)
			this.wcontainer.removeAll(true)
		
		this.wcontainer.insert(0, events)
		
		//Remove last components
		while (this.wcontainer.items.length > this.max){
			var item = this.wcontainer.getComponent(this.wcontainer.items.length -1)
			this.wcontainer.remove(item.id, true)
		}
	},
	
 	beforeDestroy : function() {
		this.unsubscribe();
		this.wcontainer.removeAll(true)
		
		this.callParent(arguments);
 	}
	
});

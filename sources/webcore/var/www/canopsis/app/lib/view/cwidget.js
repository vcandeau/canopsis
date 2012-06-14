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
Ext.define('canopsis.lib.view.cwidget' ,{
	extend: 'Ext.panel.Panel',

	border: false,
	layout : 'fit',
	
	nodeId_refresh: true,
	nodeData: {},
	nodes: [],

	data: {},

	defaultHtml: '<center><span class="icon icon-loading" /></center>',

	refreshInterval: 0,

	baseUrl: '/rest/events/event/',
	
	logAuthor: '[widget]',

	wcontainer_layout: 'fit',
	wcontainer_autoScroll: false,
	
	task: false,
	
	reportMode : false,
	exportMode : false,
	
	titleHeight: 27,
	barHeight: 27,
	
	time_window: global.commonTs.day, //24 hours

	//PollNodeInfo: true,

	initComponent: function() {

		this.logAuthor = "["+this.id+"]"

		log.debug('InitComponent '+this.id+' (reportMode: '+this.reportMode+', exportMode: '+this.exportMode+')', this.logAuthor)

		if (this.title == ''){
			this.title = false;
		}

		this.wcontainerId = this.id+"-content"

		this.wcontainer = Ext.create('Ext.container.Container', { id: this.wcontainerId, border: false, layout: this.wcontainer_layout, autoScroll: this.wcontainer_autoScroll });
		this.items = this.wcontainer
		
		this.wcontainer.on('afterrender', this.afterContainerRender, this)
		
		this.on('afterrender', function(){
			log.debug('SetHeight of wcontainer', this.logAuthor)
			this.wcontainer.setHeight(this.getHeight())
		}, this)
		
		this.callParent(arguments);

		this.uri = '/rest/events/event'

		if (this.reportMode) {
			this.refreshInterval = false
		}
		
		//Compatibility
		if (this.nodes){
			if (this.nodes.length > 0){
				log.debug('Nodes:', this.logAuthor)
				log.dump(this.nodes)
				this.nodeId = this.nodes[0].id
				this.metrics = this.nodes[0].metrics
			}
		}
		
		//if reporting
		if(this.exportMode){
			//this._reporting(this.reportStartTs,this.reportStopTs)
			//this._reporting(reportStart,reportStop)
			//this.uri += '/' + this.nodeId;
			
			/*if (this.nodeId){
				log.debug(' + NodeId: '+this.nodeId, this.logAuthor)
				this.on('afterrender', this._doRefresh, this);
			}*/
			
			//this._doRefresh()
			
		}else{
			if (this.refreshInterval){				
				log.debug(' + Refresh Interval: '+this.refreshInterval, this.logAuthor)
				this.task = {
					run: this._doRefresh,
					interval: this.refreshInterval * 1000,
					scope: this
				}
			}
		}
	},
	
	afterContainerRender: function(){
		log.debug(' + Ready', this.logAuthor)
		this.ready();
	},

	getHeight: function(){
		var height = this.callParent();
		if (this.title){ height -= this.titleHeight }
		
		var docks = this.getDockedItems()
		
		if (docks){
			height -= docks.length * 2
			for (var i in docks)
				if (docks[i].dock == 'top' || docks[i].dock == 'bottom') { height -= this.barHeight }
		}
			
		if (this.border)
			height -= this.border * 2
		
		return height
	},
	
	ready: function(){
		if (this.task){
			this.startTask();
		}else{
			this._doRefresh();
		}
	},
	
	startTask: function(){
		if (! this.reportMode) {
			if (this.task){
				log.debug('Start task, interval:  '+this.refreshInterval+' seconds', this.logAuthor)
				Ext.TaskManager.start(this.task)
			}else{
				this._doRefresh()
			}
		}
	},

	stopTask: function(){
		if (this.task){
			log.debug('Stop task', this.logAuthor)
			Ext.TaskManager.stop(this.task)
		}
	},
	
	/*
	dblclick: function(){
	},
	*/

	TabOnShow: function(){
		log.debug('Show', this.logAuthor)
		if (! this.isDisabled())
			this.startTask()
	},

	TabOnHide: function(){
		log.debug('Hide', this.logAuthor)
		this.stopTask()
	},

	_doRefresh: function(from, to){
		if (this.exportMode){
			from = this.export_from;
			to = this.export_to;
		}else{		
			if (! to || to < 10000000) {
				to = Date.now();
			}
				
			if (! from || from < 10000000) {
				from = to - (this.time_window * 1000);
			}
		}
			
		this.doRefresh(from, to)
	},
	
	doRefresh: function(from, to){
		this.getNodeInfo()
	},

	_onRefresh: function(data){
		this.data = data
		this.onRefresh(data)
	},

	onRefresh: function(data){
		log.debug("onRefresh", this.logAuthor)
	},

	onResize: function(){
		log.debug("onRezize", this.logAuthor)
	},

	getNodeInfo: function(){
		if (this.nodeId){
			Ext.Ajax.request({
				url: this.uri + '/' + this.nodeId,
				scope: this,
				success: function(response){
					var data = Ext.JSON.decode(response.responseText)
					data = data.data[0]
					this._onRefresh(data)
				},
				failure: function (result, request) {
					log.error("Impossible to get Node informations, Ajax request failed ... ("+request.url+")", this.logAuthor)
				} 
			});
		}
		
	},

	setHtml: function(html){
		log.debug('setHtml in widget', this.logAuthor)
		this.wcontainer.removeAll()
		this.wcontainer.add({html: html, border: false})
		this.wcontainer.doLayout();
	},

	setHtmlTpl: function(tpl, data){
		log.debug('setHtmlTpl in div '+this.wcontainerId, this.logAuthor)
		tpl.overwrite(this.wcontainerId, data)
	},
	
	beforeDestroy : function() {
		log.debug("Destroy ...", this.logAuthor)
		this.stopTask()
		this.callParent(arguments);
 	}

});

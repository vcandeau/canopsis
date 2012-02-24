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

	data: {},

	defaultHtml: '<center><span class="icon icon-loading" /></center>',

	refreshInterval: 0,

	baseUrl: '/rest/events/event/',
	
	logAuthor: '[widget]',

	task: false,
	
	reportMode : false,
	exportMode : false,
	
	time_window: global.commonTs.day, //24 hours

	//PollNodeInfo: true,

	initComponent: function() {

		this.logAuthor = "["+this.id+"]"

		log.debug('InitComponent '+this.id+' (reportMode: '+this.reportMode+', exportMode: '+this.exportMode+')', this.logAuthor)

		if (this.title == ''){
			this.title = false;
		}

		this.wcontainerId = this.id+"-content"

		this.wcontainer = Ext.create('Ext.container.Container', { id: this.wcontainerId, border: false });

		this.items = this.wcontainer
		
		this.wcontainer.on('afterrender', this.afterContainerRender, this)

		this.uri = '/rest/events/event'
		
		this.callParent(arguments);

		if (this.reportMode) {
			this.refreshInterval = false
		}
		
		//Compatibility
		if (this.nodes.length > 0){
			log.debug('Nodes:', this.logAuthor)
			log.dump(this.nodes)
			this.nodeId = this.nodes[0].id
			this.metrics = this.nodes[0].metrics
			console.log(this.metrics)
		}
		
		//if reporting
		if(this.exportMode){
			//this._reporting(this.reportStartTs,this.reportStopTs)
			//this._reporting(reportStart,reportStop)
			this.uri += '/' + this.nodeId;
			if (this.nodeId){
				log.debug(' + NodeId: '+this.nodeId, this.logAuthor)
				this.on('afterrender', this._doRefresh, this);
			}
		}else{
			if (this.nodeId){
				this.uri += '/' + this.nodeId;
				log.debug(' + NodeId: '+this.nodeId, this.logAuthor)

				if (this.refreshInterval){				
					log.debug(' + Refresh Interval: '+this.refreshInterval, this.logAuthor)
					this.task = {
						run: this._doRefresh,
						interval: this.refreshInterval * 1000,
						scope: this
					}
				}
			}
		}
	},
	
	//display data from timestamp
	/*_displayFromTs: function(from, to){
		if(this.displayFromTs){
			this.stopTask()
			this.displayFromTs(from, to)

		} else {
			this.setHtml('widget display data from timestamp ' + from + ' to ' + to)
		}
	},*/
	
	
	//launch by reporting.html (reporting dedicated page)
	/*_reporting: function(from, to){
		if(this.reporting){
			log.debug('Starting the report', this.logAuthor)
			this.reporting(from,to)
		} else {
			log.debug('Warning, no reporting function for '+this.id, this.logAuthor)
			this.setHtml('No reporting mode for this widget')
		}
	},*/
	
	afterContainerRender: function(){
		log.debug(' + Ready', this.logAuthor)
		this.ready();
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

	TabOnShow: function(){
		log.debug('Show', this.logAuthor)
		this.startTask()
	},

	TabOnHide: function(){
		log.debug('Hide', this.logAuthor)
		this.stopTask()
	},

	_doRefresh: function(from, to){
		if (! to || to < 10000000) {
			to = Date.now();
		}
			
		if (! from || from < 10000000) {
			from = to - (this.time_window * 1000);
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
				url: this.uri,
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
	
	getMetricUnit: function(perfArray){
		if(perfArray[this.metric]){
			return perfArray[this.metric].unit;
		} else {
			log.debug('the metric is undefined', this.logAuthor);
			return undefined;
		}
	},
	
	getHealth: function(data){
		//nodeId have perfdata ?
		if (data.perf_data_array){
			var perfArray = data.perf_data_array		
			
			//check the metric
			if(perfArray[this.metric]){
				perf = perfArray[this.metric];
				//metric is already % ?
				if(perf.unit == "%"){
					return perf.value;
				} else {
					//calculate % from max value if exist
					if(perf.max){
						var health = (perf.value / perf.max * 100);
						return health;
					} else if (this.metric_max){
						var health = (perf.value / this.metric_max * 100) ;
						return health;
					} else {
						log.debug('impossible to calculate health (no max value in data)', this.logAuthor);
						return undefined;
					}
				}
			}else{
				log.debug('the metric is undefined', this.logAuthor);
				log.dump(perfArray);
			}
		}else{
			log.debug('impossible to calculate health (no perf_data_array)', this.logAuthor);
			return undefined;
		}
	},
	
	beforeDestroy : function() {
		log.debug("Destroy ...", this.logAuthor)
		this.stopTask()
		canopsis.lib.view.cwidget.superclass.beforeDestroy.call(this);
 	}

});

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

	displayed: false,

	addToRequestManager: true,

	defaultHtml: '<center><span class="icon icon-loading" /></center>',

	refreshInterval: 0,

	baseUrl: '/rest/events/event/',
	
	logAuthor: '[widget]',

	task: false,

	initComponent: function() {

		this.logAuthor = "["+this.id+"]"

		log.debug('InitComponent '+this.id, this.logAuthor)

		if (this.title == ''){
			this.title = false;
		}

		this.divHeight = this.height
		if (this.title) {
			this.divHeight = this.height - 30
		}

		this.divId = this.id+"-content"
		this.items = [{html: "<div id='"+this.divId+"'>" + this.defaultHtml + "</div>", border: false}]

		this.uri = '/rest/events/event/' + this.nodeId;


		if (this.intervals && this.nodeId){
			this.task = {
				run: this.doRefresh,
				interval: this.intervals * 1000,
			}
		}

		this.on('afterrender', this.startTask, this);

		this.callParent(arguments);
	},
	
	reporting: function(from, to){
		this.setHtml('widget reporting from date ' + from + ' to ' + to)
	},

	startTask: function(){
		if (this.task){
			log.debug('Start task, interval:  '+this.interval+' seconds', this.logAuthor)
			Ext.TaskManager.start(this.task)
		}else{
			if (this.nodeId){
				this.doRefresh()
			}else{
				if (! this.displayed){
					this.displayed = true
					this.doRefresh()
				}
			}
		}
	},

	stopTask: function(){
		if (this.task){
			log.debug('Stop task', this.logAuthor)
			Ext.TaskManager.stop(this.task)
		}
	},

	onShow: function(){
		log.debug('Show', this.logAuthor)
		this.startTask()
	},

	onHide: function(){
		log.debug('Hide', this.logAuthor)
		this.stopTask()
	},

	doRefresh: function(){
		Ext.Ajax.request({
			url: this.uri,
			scope: this,
			success: function(response){
				var data = Ext.JSON.decode(response.responseText)
				data = data.data[0]
				this.data = data
				this.onRefresh(data)
				this.displayed = true
			},
		});
	},

	onRefresh: function(data){
		log.debug("onRefresh", this.logAuthor)
	},

	setHtml: function(html){
		log.debug('setHtml in widget', this.logAuthor)
		this.removeAll()
		this.add({html: html, border: false})
		this.doLayout();
	},

	setHtmlTpl: function(tpl, data){
		log.debug('setHtmlTpl in div '+this.divId, this.logAuthor)
		tpl.overwrite(this.divId, data)
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

});

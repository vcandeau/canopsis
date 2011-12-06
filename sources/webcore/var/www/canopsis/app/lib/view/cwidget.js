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

	defaultHtml: '<center><span class="icon icon-loading" /></center>',

	refreshInterval: 0,
	baseUrl: '/rest/inventory/event/',
	
	logAuthor: '[view][cwidget]',

	initComponent: function() {
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

		this.callParent(arguments);

		this.mytab.requestManager.register(this,this.nodeId,this.refreshInterval);

		if (this.refreshInterval > 0){

			//log.debug('Set refresh Interval to ' + this.refreshInterval + ' seconds', this.logAuthor)
			/*
			this.task = {
				run: this.doRefresh,
				scope: this,
				interval: this.refreshInterval * 1000
			}
			//Ext.TaskManager.start(this.task);

			if (this.mytab){
				this.mytab.on('show', function(){
					Ext.TaskManager.start(this.task);
				}, this);
				this.mytab.on('hide', function(){
					Ext.TaskManager.stop(this.task);
				}, this);
			/*	this.mytab.on('timeSet', function(){
					Ext.TaskManager.stop(this.task);
					this.timeNavigator;
				}, this);
			}*/

		}else{
			this.on('afterrender', this.doRefresh, this);
		}
			
	},
	
	timeNavigator: function(){
		this.doRefresh();
	},
	
	refreshData: function(data){
		log.debug('data receive from ajax request', this.logAuthor)
		//log.dump(data);
		this.nodeData = data
		this.doRefresh()
	},

	doRefresh: function (){
		log.debug('doRefresh', this.logAuthor)
		/*
		if (this.nodeId) {
			if (this.nodeId_refresh){
				//this.setLoading(true)
				log.debug(' + Get informations of ' + this.nodeId, this.logAuthor)
				Ext.Ajax.request({
					url: this.baseUrl + this.nodeId,
					scope: this,
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data[0]
						//this.setLoading(false)
						this.nodeData = data
						this.onRefresh(data)
					},
					failure: function ( result, request) {
						log.debug('Ajax request failed', this.logAuthor)
						//this.setLoading(false)
					} 
				})
			}else{
				log.debug(' + nodeId_refresh is false', this.logAuthor)
				this.onRefresh(this.nodeData)
			}
		}else{
			log.debug(" + No node ...", this.logAuthor)
			this.onRefresh(this.nodeData)
		}
		*/
		
		//var record = this.mytab.nodeId_refresh_values.findRecord('_id', this.nodeId);
		var record = this.nodeData
		//log.debug('record  :  ');
		//log.dump(record);
		if(record){
			//this.onRefresh(record.data)
			this.onRefresh(record);
		} else {
			log.debug("Ajax request not stored", this.logAuthor)
			this.onRefresh()
		}

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
	}
});

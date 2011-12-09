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
	
	addToRequestManager: true,

	defaultHtml: '<center><span class="icon icon-loading" /></center>',

	refreshInterval: 0,
	baseUrl: '/rest/events/event/',
	
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
		
		//the widget register himself to his view
		if(this.addToRequestManager){
			this.mytab.register(this,this.nodeId,this.refreshInterval);
		}
		
		if (this.refreshInterval > 0){


		}else{
			this.on('afterrender', this.doRefresh, this);
		}
			
	},
	
	reporting: function(from, to){
		this.setHtml('widget reporting from date ' + from + ' to ' + to)
	},
	
	refreshData: function(data){
		//log.debug('data receive from ajax request', this.logAuthor)
		//log.dump(data);
		this.nodeData = data
		this.doRefresh()
	},

	doRefresh: function (){
		log.debug('doRefresh', this.logAuthor)
		var record = this.nodeData
		if(record){
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

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
//Ext.require([
//    'Ext.direct.*',
//]);

Ext.define('canopsis.view.Tabs.Content' ,{
	extend: 'Ext.Panel',
	alias : 'widget.TabsContent',

	logAuthor: '[view][tabs][content]',
    
	style: {borderWidth:'0px'},

	autoScroll: true,
	
	layout: {
		type: 'table',
		// The total column count must be specified here
		columns: 1,
	},

	defaults: {
		border: false,
	},

	border: false,

	displayed: false,

	items: [],
    
	initComponent: function() {
		this.on('beforeclose', this.beforeclose)
		this.callParent(arguments);

		log.dump("Get view '"+this.view_id+"' ...", this.logAuthor)
			
		Ext.Ajax.request({
			url: '/rest/object/view/'+this.view_id,
			scope: this,
			success: function(response){
				data = Ext.JSON.decode(response.responseText)
				this.view = data.data[0]

				if (this.autoshow){
					this.setContent();
				}else{
					this.on('show', function (){
						if (! this.displayed) {
							this.setContent();
							this.displayed = true;
						}
					}, this)
				}

			},
			failure: function (result, request) {
					log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
			} 
		});
		
	},

	setContent: function(){
		var items = this.view.items;
		var totalWidth = this.getWidth() - 20;
		
		this.itemsReady = []//tab to buffer items before add them to page
		
		//------------creating ajax requestManager or reportWidgetList-------------
		if(this.view.reporting){
			this.reportWidgetList = []
		}else{
			this.requestManager = Ext.create('canopsis.lib.requestManager');
		}

		//---------------General options---------------------
		if(this.options.nodeId){
			//if id specified by cgrid (on-the-fly view)
			var nodeId = this.options.nodeId;
		} else {
			var nodeId = this.view.nodeId;
		}
		var refreshInterval = this.view.refreshInterval
		var nbColumns = this.view.nbColumns
		var rowHeight = this.view.rowHeight

		if (! rowHeight) { rowHeight = 200 }
		if (! refreshInterval) { refreshInterval = 0 }
		if (! nbColumns) { nbColumns = 1 }

		this.layout.columns = nbColumns

		log.debug('Create '+nbColumns+' column(s)..', this.logAuthor)
		
		//-----------------populating with widgets--------------
		if (items.length == 1 && nbColumns == 1) {
			//one widget, so full mode
			log.debug(' + Use full mode ...', this.logAuthor)
			this.layout = 'fit'
			item = items[0]

			log.debug('   + Add: '+item.xtype, this.logAuthor)

			//item['height'] = '10'
			item['width'] = '100%'
			item['title'] = ''
			item['fullmode'] = true
			
			//item['baseCls'] = 'x-plain'
			item['mytab'] = this

			//Set default options
			if (! item.nodeId) { item.nodeId=nodeId}
			if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
			
			//add item in the view
			this.add(item)

		}else{
			//many widgets
			//this.removeAll();

			//fixing layout (table goes wild without it)
			for (i; i<nbColumns; i++){
				this.add({ html: '', border: 0, height: 0, padding:0})
			}
	
			var ext_items = []
			for(var i= 0; i < items.length; i++) {
				log.debug(' - Item '+i+':', this.logAuthor)
				var item = items[i]

				log.debug('   + Add: '+item.xtype, this.logAuthor)

				item['mytab'] = this
				item['fullmode'] = false

				var colspan = 1
				var rowspan = 1

				if (item['colspan']) { colspan = item['colspan'] }
				if (item['rowspan']) { rowspan = item['rowspan'] }
				
				item['width'] = (totalWidth / nbColumns) * colspan

				item['style'] = {padding: '3px'}

				//Set default options
				if (! item.nodeId) { item.nodeId=nodeId}
				if (! item.refreshInterval) { item.refreshInterval=refreshInterval}
				if (! item.rowHeight) { item.height=rowHeight }else{ item.height=item.rowHeight }
				if (item.title){ item.border = true }
				
				this.itemsReady.push(item);
			}
			this.addReadyItem()
		}
		
		//add docked bar with listeners if reporting mode, else launch task manager
		if(this.view.reporting){
			//------------create and adding tbar-----------
			this.reportFrom = Ext.create('Ext.form.field.Date',{
				xtype: 'datefield',
				name: 'from',
				fieldLabel: 'From',
				value: new Date(),
				maxValue: new Date(),
			})
			
			this.reportTo = Ext.create('Ext.form.field.Date',{
				xtype: 'datefield',
				name: 'to',
				fieldLabel: 'To',
				value: new Date(),
			})
			
			this.reportButton = Ext.create('Ext.button.Button',{
				xtype: 'button', // default for Toolbars
				text: 'fetch',
			})
			
			this.bar = Ext.create('Ext.toolbar.Toolbar', {
				dock: 'top',
				items: [this.reportFrom,this.reportTo,this.reportButton]
			});
			this.addDocked(this.bar);
			
			//---------------binding actions to button-----------
			this.reportButton.on('click',function(){
					var fromValue = Ext.Date.format(this.reportFrom.getValue(), 'U');
					var toValue = Ext.Date.format(this.reportTo.getValue(), 'U');
					this.doReport(fromValue,toValue)
				}, this
			);
			
		} else {
			//Start managing request
			this.requestManager.startTask();
			//binding event to save ressources
			this.on('show', function(){
				this.requestManager.resumeTask();
			}, this);
			this.on('hide', function(){
				this.requestManager.pauseTask();
			}, this);
		}
	},
	
	addReadyItem : function(){
		for (i in this.itemsReady){
			this.add(this.itemsReady[i])
		}
	},
	
	//widget subscribe with this
	register : function(widget,nodeId,interval){
		if(this.view.reporting){
			this.reportWidgetList.push(widget);
		} else {
			if(interval != 0){
				this.requestManager.register(widget,nodeId,interval);
			}
		}
	},
	
	//request widgets to switch to report mode
	doReport : function(from, to){
		for (i in this.reportWidgetList){
			this.reportWidgetList[i].reporting(from,to);
		}
	},
	
	//don't mind about this code
/*	
	fetchOldValues: function(time){
		time = 1322757247
		this.stopAllTask();
		//for each nodeId stored
		log.debug('fetching metrics at time' + time, this.logAuthor)
		log.dump(this.nodeId_refresh_values)
		for (i in this.nodeId_refresh_values){
			//log.dump(this.nodeId_refresh_values);
			//if there is a perf_data_array
			var perfArray = this.nodeId_refresh_values[i].perf_data_array
			log.debug('the nodeId is : ' + i)
			if(perfArray){
				log.debug(perfArray)
				var metrics = [];
				//get metrics of this node
				for( y in perfArray){
					metrics.push(y);
				}
				
				log.debug('metric are ' + metrics);
				
				//url = '/perfstore/'+ i +'/'+ metrics +'/' + '1322665971000/1322665971',//timestamp * 1000 
				url = '/perfstore/'+ i +'/'+ metrics +'/' + time * 1000 + '/' + time,//timestamp * 1000 
				//log.debug('the url')
				//log.dump(url)
				
				//request metrics from this store
				Ext.Ajax.request({
						url: url ,
						scope: this,
						success: function(response){
							var data = Ext.JSON.decode(response.responseText)
							data = data.data
							log.debug('-------------dump ajax request-----------')
							log.dump(data)
							//log.dump(this.nodeId_refresh_values[i].perf_data_array)
							this.metricsBuffer.push(data)
							//log.debug('buffered metrics')
							//log.dump(this.metricsBuffer)
							
							//count number of node, .length return 0
							var count = 0
							for(c in this.nodeId_refresh_values){
								count++
							}

							//log.debug('metricsBuffer.length : ' + this.metricsBuffer.length);
							//log.debug('this.nodeId_refresh_values : ' + count);
							if(this.metricsBuffer.length == count){
								this.updateMetricsFromBuffer()
							}
						},
						failure: function (result, request) {
							log.debug('Ajax request failed', this.logAuthor)
						} 
				});
			} else {
				//means that the nodeId doesn't have metrics
				this.metricsBuffer.push(null);
			}
		}
	},
	
	//update metrics in nodeId_refresh_values from metricsBuffer
	updateMetricsFromBuffer : function(){
		var metricsLength = this.metricsBuffer.length -1 
		var counter = 0;
		for( i in this.nodeId_refresh_values ){
			var metrics = this.metricsBuffer[counter]//.metric;
			if(metrics){				
				//log.debug(metrics)
				for(j in metrics){
					log.debug('-----------')
					//log.dump(metrics[j]);
					//log.dump(metrics[j].metric);
					if(metrics[j].values[0]){
						log.dump(metrics[j].values[0][1]);
						log.debug('------out-----');
						//log.dump(this.nodeId_refresh_values[i])	
						//log.dump(this.nodeId_refresh_values[i].perf_data_array)
						if(this.nodeId_refresh_values[i].perf_data_array){
							log.dump(this.nodeId_refresh_values[i].perf_data_array[metrics[j].metric])
							log.debug('old value')
							log.dump(this.nodeId_refresh_values[i].perf_data_array[metrics[j].metric].value)
							this.nodeId_refresh_values[i].perf_data_array[metrics[j].metric].value = metrics[j].values[0][1]; //values[0] means the first value of an metric array, [1] is the value of array 0 is the timestamp
							log.debug('new value')
							log.dump(this.nodeId_refresh_values[i].perf_data_array[metrics[j].metric].value)
						}
					}
				}
			}
			counter ++
		}
		//clean buffer
		this.metricsBuffer = []
	},

	//Stock,manage and launch refreshed nodeId
	manageNodeId: function(item) {
		log.debug("start refresh task for " + item.nodeId , this.logAuthor)
		if(item.refreshInterval > 0){
			if(item.nodeId in this.taskList){
				log.debug('ajax request already stored', this.logAuthor);
				//check refresh time
				//log.debug(item.nodeId)
				//log.debug(this.nodeId_refresh_values)
				if(item.refreshInterval < this.taskList[item.nodeId].refresh){
					log.debug('set the new ajax request refresh time', this.logAuthor);
					Ext.TaskManager.stop(this.taskList[item.nodeId].task);
					this.taskList[item.nodeId].task.interval = item.refreshInterval * 1000
					this.taskList[item.nodeId].refresh = item.refreshInterval * 1000
					Ext.TaskManager.start(this.taskList[item.nodeId].task);
				}
			} else {
				log.debug('nodeId not already check,start task every ' + item.refreshInterval + "second", this.logAuthor);
				var task = {
					run : function(){
							log.debug(' + Get informations of ' + item.nodeId, this.logAuthor)
							Ext.Ajax.request({
								url: '/rest/events/event/' + item.nodeId,
								scope: this,
								success: function(response){
									var data = Ext.JSON.decode(response.responseText)
									data = data.data[0]
									log.debug('ajax request success, stocking result', this.logAuthor);
									//deleting old record if exist
									var oldRecord = this.nodeId_refresh_values.find('_id', data._id)
									if(oldRecord != -1){
										log.debug('old record found, remove it');
										this.nodeId_refresh_values.removeAt(oldRecord);
									}									
									var record = Ext.create('canopsis.model.event', data);
									this.nodeId_refresh_values.add(record);
									//log.dump(this.nodeId_refresh_values);
								},
								failure: function (result, request) {
								log.debug('Ajax request failed', this.logAuthor)
								} 
							});
						},
					scope : this,
					interval : item.refreshInterval * 1000
				}
				//start task and pushing it in tasklist
				Ext.TaskManager.start(task);
				this.taskList[item.nodeId] = {'task':task,'refresh':item.refreshInterval}
				//log.debug('--------------------task are : -------------------');
				//log.dump(this.taskList)
			}
		} else {
			log.debug("refresh nodeId set to 0, one ajax request set", this.logAuthor)
			//if already in tasklist do nothing (means someone is already refresh it, data already available
			if(!(item.nodeId in this.taskList)){
				log.debug("request " + item.nodeId + "without task" , this.logAuthor)
				Ext.Ajax.request({
					url: '/rest/events/event/' + item.nodeId,
					scope: this,
					//async :false,
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data[0]
						//pushing value
						var record = Ext.create('canopsis.model.event', data);
						this.nodeId_refresh_values.add(record);
					},
					failure: function (result, request) {
					log.debug('Ajax request failed', this.logAuthor)
					} 
				});
			}
			
		}
	}, */
    
    stopAllTask: function(){
		for (i in this.taskList){
			Ext.TaskManager.stop(this.taskList[i].task);
		}
	},
	
	startAllTask: function(){
		for (i in this.taskList){
			Ext.TaskManager.start(this.taskList[i].task);
		}
	},
    
	beforeclose: function(tab, object){
		//stop all the task
		log.debug("Stopping all task", this.logAuthor)
		this.stopAllTask();
		
		log.debug('Active previous tab', this.logAuthor);
		old_tab = Ext.getCmp('main-tabs').old_tab;
		if (old_tab) {
			Ext.getCmp('main-tabs').setActiveTab(old_tab);
		}
		
		if (this.localstore_record){
			//remove from store
			log.debug("Remove this tab from localstore ...", this.logAuthor)
			var store = Ext.data.StoreManager.lookup('Tabs');
			store.remove(this.localstore_record);
			store.save();
		}
	},

 	beforeDestroy : function() {
		log.debug("Destroy items ...", this.logAuthor)
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
 		log.debug(this.id + " Destroyed.", this.logAuthor)
 	}
});

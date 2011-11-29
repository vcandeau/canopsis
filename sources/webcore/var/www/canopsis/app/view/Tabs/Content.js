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
		/*tableAttrs: {
			style: {
				width: '100%',
            		}
		},*/
	},

	defaults: {
		border: false,
		/*style: {
	            padding: '3px',
	        }*/
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
		
		this.nodeId_refresh_values = []//tab with value request by widget, centralize them
		this.taskList = []//tab of task launch in order to refresh ajax request
		this.itemsReady = []//tab to buffer items before add them to page

		//General options
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

			//Stock,manage and launch refreshed nodeId
			if(item.nodeId){
				this.manageNodeId(item);
			}
			//add item in the view
			this.add(item)
		}else{
			//many widgets
			this.removeAll();

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
				
				//Stock,manage and launch refreshed nodeId
				if(item.nodeId){
					this.manageNodeId(item);
				}
				
				//buffer item
				this.itemsReady.push(item);
				//this.add(item);

			}
			//adding widgets to the page
			var dtask = new Ext.util.DelayedTask(function(){
				this.addReadyItem()
			},this);
			dtask.delay(500);
			
			//pause task if tab not shown
			log.debug("Binding auto start/stop ajax request on tab show/hide", this.logAuthor)
			this.on('show', function(){
				this.startAllTask();
			}, this);
			this.on('hide', function(){
				this.stopAllTask();
			}, this);
			
			
		}
	},
	
	addReadyItem : function(){
		for (i in this.itemsReady){
			this.add(this.itemsReady[i])
		}
		log.debug(this);
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
							log.debug(item)
							Ext.Ajax.request({
								url: '/rest/inventory/event/' + item.nodeId,
								scope: this,
								//async :false,
								success: function(response){
									var data = Ext.JSON.decode(response.responseText)
									data = data.data[0]
									//pushing value
									//log.debug('ajax request success, stocking result', this.logAuthor);
									this.nodeId_refresh_values[item.nodeId] = data;
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
			}
		} else {
			log.debug("refresh nodeId set to 0, one ajax request set", this.logAuthor)
			//if already in tasklist do nothing (means someone is already refresh it, data already available
			if(!(item.nodeId in this.taskList)){
				log.debug("request " + item.nodeId + "without task" , this.logAuthor)
				Ext.Ajax.request({
					url: '/rest/inventory/event/' + item.nodeId,
					scope: this,
					async :false,
					success: function(response){
						var data = Ext.JSON.decode(response.responseText)
						data = data.data[0]
						//pushing value
						this.nodeId_refresh_values[item.nodeId] = data;
					},
					failure: function (result, request) {
					log.debug('Ajax request failed', this.logAuthor)
					} 
				});
			}
			
		}
	},
    
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

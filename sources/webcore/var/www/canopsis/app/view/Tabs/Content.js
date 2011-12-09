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
		if (items.length == 1 ) {
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
				maxValue: new Date(),
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
					log.debug('ts start : ' + fromValue +' ts stop : ' + toValue);
					this.doReport(fromValue*1000,toValue*1000)
				}, this
			);
			
		} else {
			//Start managing request
			if(this.requestManager.startTask()){
				//binding event to save ressources
				this.on('show', function(){
					this.requestManager.resumeTask();
				}, this);
				this.on('hide', function(){
					this.requestManager.pauseTask();
				}, this);
			}
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
    
	beforeclose: function(tab, object){
		//stop all the task
		if(!this.view.reporting){
			log.debug("Stopping all task", this.logAuthor)
			this.requestManager.stopTask();
		}
	
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

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

		this.widgets = []

		log.dump("Get view '"+this.view_id+"' ...", this.logAuthor)
		
		//Get view options
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
					log.error("Close tab, maybe not exist ...", this.logAuthor)
					this.close();
			} 
		});

		this.on('beforeclose', this.beforeclose)
		this.callParent(arguments);	
	},

	setContent: function(){
		var items = this.view.items;
		var totalWidth = this.getWidth() - 20;
		
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
		if (! nbColumns || items.length == 1) { nbColumns = 1 }

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
			//this.register(item,item.nodeId,item.refreshInterval);

			var widget = this.add(item);
			this.widgets.push(widget)

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

				var widget = this.add(item);
				this.widgets.push(widget)
			}
		}
		
		if(this.view.reporting){
			this.reportBar = Ext.create('canopsis.view.Reporting.Reporting');
			this.addDocked(this.reportBar);
			this.reportBar.requestButton.on('click',this.onReport,this);
			this.reportBar.nextButton.on('click',this.nextReportButton,this);
			this.reportBar.previousButton.on('click',this.previousReportButton,this);
		}else{
			//binding event to save resources
			this.on('show', function(){
				this._onShow();
			}, this);
			this.on('hide', function(){
				this._onHide();
			}, this);
		}
	},
	
	//---------------------Reporting functions--------------------
	onReport: function(){
		log.debug('Request reporting on a time', this.logAuthor)
		var toolbar = this.reportBar
		var endReport = parseInt(Ext.Date.format(toolbar.currentDate.getValue(), 'U'));
		var startReport =	endReport - toolbar.combo.getValue();
		for (i in this.widgets){
			this.widgets[i]._displayFromTs(startReport * 1000,endReport * 1000)
		}
	},
	
	nextReportButton: function(){
		var inputField = this.reportBar.currentDate;
		var startReport = parseInt(Ext.Date.format(inputField.getValue(), "U"))
		var timeUnit = this.reportBar.combo.getValue()
		//add the time and build a date
		var endReport = startReport + timeUnit
		var newDate = new Date(endReport * 1000)
		//set the time
		inputField.setValue(newDate)
		//ask widget to go on reporting
		this.onReport()
	},
	
	previousReportButton: function(){
		var inputField = this.reportBar.currentDate;
		var startReport = parseInt(Ext.Date.format(inputField.getValue(), "U"))
		var timeUnit = this.reportBar.combo.getValue()
		//substract the time and build a date
		var endReport = startReport - timeUnit
		var newDate = new Date(endReport * 1000)
		//set the time
		inputField.setValue(newDate)
		//ask widget to go on reporting
		this.onReport()
	},
	//------------------------------------------------------------

	_onShow: function(){
		log.debug('Show tab '+this.id, this.logAuthor)
		if (this.widgets){
			var i;
			for (i in this.widgets){
				this.widgets[i].onShow()
			}
		}
	},

	_onHide: function(){
		log.debug('Hide tab '+this.id, this.logAuthor)
		if (this.widgets){
			var i;
			for (i in this.widgets){
				this.widgets[i].onHide()
			}
		}
	},
	
	beforeclose: function(tab, object){
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

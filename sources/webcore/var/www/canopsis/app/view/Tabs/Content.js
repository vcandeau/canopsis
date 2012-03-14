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
Ext.define('canopsis.view.Tabs.Content' ,{
	extend: 'Ext.jq.Gridable',
	
	alias : 'widget.TabsContent',

	logAuthor: '[view][tabs][content]',

	autoScroll: true,
		
	autoshow: true,
	displayed: false,

	items: [],
	
	//Ext.jq.Gridable
	spotlight : true,
	contextMenu : true,
	
	debug: false,
	
	autoScale: true,
	autoDraw: false,
	wizard: 'canopsis.view.Tabs.wizard',
	
	// Export an report
	reportMode : false,
	exportMode : false,
	export_from : undefined,
	export_to : undefined,
	
    //Init
	initComponent: function() {
		this.callParent(arguments);
				
		log.debug("Display view '"+this.view_id+"' ...", this.logAuthor)
		
		this.options = {
			reportMode : this.reportMode,
			exportMode : this.exportMode,
			export_from : this.export_from,
			export_to : this.export_to
		}

		Ext.Ajax.request({
				url: '/rest/object/view/'+this.view_id,
				scope: this,
				success: function(response){
					data = Ext.JSON.decode(response.responseText)
					this.view = data.data[0]
					this.dump = this.view.items

					this.fireEvent('ready', this)

				},
				failure: function (result, request) {
						log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
						log.error("Close tab, maybe not exist ...", this.logAuthor)
						this.close();
				} 
		});


		this.on('ready', function(){
			if (this.autoshow){
				this.setContent()
			}
		}, this)
		
		this.on('save', this.saveView, this)

		this.on('beforeclose', this.beforeclose)
		
		//binding event to save resources
		this.on('show', this._onShow, this);
		this.on('hide', this._onHide, this);
		this.on('resizeWidget', this.onResizeWidget, this);

	},

	onResizeWidget: function(cmp){
		cmp.onResize()
	},

	setContent: function(){
		if(this.dump && ! this.displayed){
			log.dump(this.dump)
			this.load(this.dump)
			this.displayed = true
		}
	},
	
	saveView : function(dump){
		//ajax request with dump sending
		log.debug('Saving view requested',this.logAuthor)
		
		if (dump == undefined){
			dump = this.dumpJqGridable()
		}
		
		log.dump(dump)
		
		var store = Ext.data.StoreManager.lookup('View')
		var record = Ext.create('canopsis.model.view', data)
		
		if(this.view_id){
			log.debug('editing view')
			record.set('id',this.view_id)
			record.set('crecord_name',this.view.crecord_name)
		} else {
			log.debug('new view')
			if(this.options.viewName){
				viewName = this.options.viewName
				record.set('crecord_name',this.options.viewName)
				record.set('id','view.'+ global.account.user + '.' + viewName.replace(/ /g,"_"))
			}
		}
		record.set('items',dump)
		record.set('leaf', true)
		
		store.add(record)
		
		this.dump = dump
		
		//this.doRedraw()
		this.startAllTasks();
		
		global.notify.notify(_('View') +' '+ record.get('crecord_name'), _('Saved'))
	},
	
	//Binding
	_onShow: function(){
		log.debug('Show tab '+this.id, this.logAuthor)
		var cmps = this.getCmps()
		for(var i in cmps){
			if (cmps[i].TabOnShow){
				cmps[i].TabOnShow()
			}
		}
	},

	_onHide: function(){
		log.debug('Hide tab '+this.id, this.logAuthor)
		var cmps = this.getCmps()
		for(var i in cmps){
			if (cmps[i].TabOnHide){
				cmps[i].TabOnHide()
			}
		}
	},
	
	editMode: function(){
		if (! this.edit){
			this.stopAllTasks();
			this.callParent(arguments);
		}
	},
	
	startAllTasks: function(){
		log.debug('Start all tasks', this.logAuthor)
		var cmps = this.getCmps()
		for(var i in cmps){
			if (cmps[i].startTask){
				cmps[i].startTask()
			}
		}		
	},
	
	stopAllTasks: function(){
		log.debug('Stop all tasks', this.logAuthor)
		var cmps = this.getCmps()
		for(var i in cmps){
			if (cmps[i].stopTask){
				cmps[i].stopTask()
			}
		}		
	},
	
	//Reporting
	addReportingBar : function() {
		log.debug('creating reporting bar', this.logAuthor)
		var bar = Ext.widget('ReportingBar')
		log.debug('bar created')
		this.addDocked(bar)
	},
	
	removeReportingBar : function(){
		log.debug('removing reporting bar', this.logAuthor)
	},
	
	//// Tabs COOKING
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
 	},
 	
 
});

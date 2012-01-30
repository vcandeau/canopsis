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
Ext.define('canopsis.controller.ViewBuilder', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['ViewBuilder.View', 'ViewBuilder.Form'],
	stores: ['View', 'Widget'],
	models: ['view', 'widget'],
	logAuthor: '[controller][ViewBuilder]',

	iconCls: 'icon-crecord_type-view',

	init: function() {
		log.debug('Initialize ...',this.logAuthor);

		this.formXtype = 'ViewBuilderForm'
		this.listXtype = 'ViewBuilder'

		this.modelId = _('view')
		
		this.widgetCounter = 0

		this.callParent(arguments);
	},
	
	_addButton: function(button) {
		log.debug('clicked addButton',this.logAuthor);
		log.debug("Create tab '"+this.formXtype+"'",this.logAuthor)
		
		this.form = add_view_tab('ViewBuilderForm', '*'+ _('New') +' '+this.modelId, true, undefined, true, false, false)

		this._bindFormEvents(this.form)
		
	},	
	
	_editRecord: function(view, item, index) {
		log.debug('Editing record',this.logAuthor);
		var viewName = item.get('crecord_name')
		this.form = add_view_tab('ViewBuilderForm', 'edit ' + viewName, true, undefined, true, false, false)
		
		//if there is items load them
		var items = Ext.decode(item.get('items'))
		//log.dump(items)
		if(items.length != 0){
			//log.debug('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ')
			this.form.jqDraggable._load(items)
		}
		log.dump(this.form.jqDraggable._dump())
		//load and disable name selection
		this.form.edit = true
		this.form.viewName.setValue(viewName)
		this.form.viewName.setDisabled(true)
		
		this._bindFormEvents(this.form)
	},
	
	_duplicateRecord: function() {
		log.debug('Editing record',this.logAuthor);
		var item = this.grid.getSelectionModel().getSelection()[0]
		var viewName = item.get('crecord_name')
		this.form = add_view_tab('ViewBuilderForm', 'edit ' + viewName, true, undefined, true, false, false)
		
		//if there is items load them
		var items = Ext.decode(item.get('items'))
		if(items.length != 0){
			this.form.jqDraggable._load(items)
		}
		//load and disable name selection
		this.form.viewName.setValue(viewName)
		this._bindFormEvents(this.form)
	},
	
	_bindFormEvents: function(form){
		log.debug('Binding WYSIWYG editor',this.logAuthor);
		
		//form.addWidgetButton.on('click', this.create_wizard,this)
		form.saveButton.on('click',this._saveForm,this)
		form.cancelButton.on('click', function(){ this._cancelForm(form) },this)

		form.addRow.on('click',form.jqDraggable.add_row,form.jqDraggable)
		form.addColumn.on('click',form.jqDraggable.add_column,form.jqDraggable)
		
		//-----------------------custom events----------------------
		form.jqDraggable.on('widgetAdd',this.create_wizard,this)
		form.jqDraggable.on('dblclickWidget',this.editWidget,this)
	},
	
	//launched when widgetAdd is fired
	create_wizard: function(id){
		this.widgetWizard = Ext.create('canopsis.view.ViewBuilder.wizard')
		this.widgetWizard.show()
		var finishButton = this.widgetWizard.down('[action=finish]')
		//binding events
		finishButton.on('click', function(){this._saveWidgetForm(id)},this)
		this.widgetWizard.on('destroy', function(){this.form.enable()},this)
		this.form.disable()
	},
	
	//launched when dblclick is launched
	editWidget : function(id){
		var data = this.get_from_widget(id)
		this.widgetWizard = Ext.create('canopsis.view.ViewBuilder.wizard',{edit: true,widgetData : data})
		this.widgetWizard.show()
		var finishButton = this.widgetWizard.down('[action=finish]')
		finishButton.on('click', function(){this._saveWidgetForm(id)},this)
		//log.debug(data)
	},
	
	_saveForm : function(form){
		log.debug('Saving form',this.logAuthor);
		
		//check if view have a name
		if(this.form.viewName.isValid() || this.form.edit){
			var dump = this.form.jqDraggable._dump()
			var store = this.grid.store;
			var record = Ext.create('canopsis.model.view', data);
			var store = this.grid.store;
			var widget_list = []
			
			//----------------------------parsing widgets-----------------------------
			for(var i in dump){
				//log.dump(dump[i])
				var widget = dump[i]
				var widgetData = dump[i].data
				var widgetAttrTpl = this._get_widget_attribute(dump[i].data.widget)

				//fix informations
				widgetAttrTpl.push('title','widget','refreshInterval','nodeId')
				
				for(var j in widgetData){
					if(widgetAttrTpl.indexOf(j) == -1){
						log.debug('deleted ' + j)
						delete widgetData[j]
					}
				}
				//widget_list.push(formatted_widget)
			}


			record.set('items',Ext.encode(dump))
			log.dump(dump)
			
			//--------------------------general variable----------------------
			var viewName = this.form.viewName.getValue()
			record.set('crecord_name',viewName);
			record.set('id','view.'+ global.account.user + '.' + viewName.replace(/ /g,"_"))
			record.set('template',this.form.template.getValue())
			record.set('reporting',this.form.reporting.getValue())
			
			//--------------------check if already exist---------------
			var recordId = record.get('id')
			var already_exist = store.findBy(
				function(storeRecord, id){
					if(storeRecord.get('id') == recordId){
						return true;  // a record with this data exists
					}
				}, this
			);

			//if didn't already exist, save it
			if(already_exist == -1 || this.form.edit == true ){
				//------------------add new view------------------
				log.dump(record)
				store.add(record);
				store.load();
				this._cancelForm(this.form);
			} else {
				log.debug('['+this.id+'][validateForm] -  View exist');
			}
			
		} else {
			global.notify.notify(
				"view name empty !",
				"you must provide a valid view name")
		}
	},
	
	_get_widget_attribute : function(widget){
		var widgetStore = Ext.data.StoreManager.lookup('Widget')
		var output = []

		var _index = widgetStore.findBy(
		function(record, id){
			if(record.get('name') == widget){
				return true
			}
		}, this)
		var attr_list = widgetStore.getAt(_index).get('options')
		
		for(var i in attr_list){
			if(attr_list[i].name){
				output.push(attr_list[i].name)
			}
		}
		return output		
	},
	
	_saveWidgetForm : function(id){
		data = this.widgetWizard.get_variables()
		this.stock_in_widget(id,data)
		//this.form.jqDraggable._refresh_widget_content(id,data.title,data.widget + ' (i\'m a test writing)')
		this.widgetWizard.destroy()
	},

	loadRecord : function(){
		log.debug('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
	},
	
	stock_in_widget : function(id,data){
		log.debug('stock data in widget',this.logAuthor);
		this.form.jqDraggable.set_data(id,data)
	},
	
	get_from_widget : function(id){
		return this.form.jqDraggable.get_data(id)
	},

});

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
Ext.define('canopsis.lib.view.cwizard' ,{
	extend: 'Ext.window.Window',

	alias : 'widget.ViewBuilderWizard',

	title: _('Wizard'),
	closable: true,
	closeAction: 'destroy',
	width: 600,
	minWidth: 350,
	height: 350,
	layout: 'fit',
	bodyStyle: 'padding: 5px;',
	
	//see bind_action_to_var function for explanation
	panel_events_list : false,
	
	step_list: [{
			title: _("i'm empty !"),
			html: _('you must give an object to fill me')
		}],
	
	bbar : [{xtype:'button',text:_('Previous'),action:'previous'},
			{xtype:'button',text:_('Next'),action:'next'},'->',
			{xtype:'button',text:_('Cancel'),action:'cancel'},
			{xtype:'button',text:_('Finish'),disabled:false,action:'finish'}],
	
	initComponent: function() {
		this.logAuthor = '[Wizard '+ this.id+']'
		log.debug('Create Wizard "' + this.title + '"' ,this.logAuthor)
		
		//the following keep a trace of asked information
		this.returnedVariable = {}
		
		this.callParent(arguments);
		
		//---------------build the window content---------------
		this.centerPanel = this.add({
			layout: 'fit',
			xtype: 'tabpanel',
		})
		
		if(this.step_list){
			var tmp = this.build_step_list(this.step_list)
			log.debug("Wizard steps fully generated",this.logAuthor)
			this.add_new_step(tmp)
		}
		
		if(this._after_step_list){
			this._after_step_list()
		}
		
	},
	
	afterRender : function(){
		//needed
		this.callParent(arguments);
		this.centerPanel.setActiveTab(0)
		this.bind_buttons()
		if(this.panel_events_list){
			this.bind_panel_events(this.panel_events_list)
		}
		
	},
	
	
	bind_buttons: function(){
		log.debug("binding buttons",this.logAuthor)
		//---------------------previous button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=previous]')
		for (i in btns){
			btns[i].on('click', this.previous_button, this)
		}
		//---------------------next button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=next]')
		for (i in btns){
			btns[i].on('click', this.next_button, this)
		}
		//---------------------cancel button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=cancel]')
		for (i in btns){
			btns[i].on('click', this.cancel_button, this)
		}
	},
	
	add_new_step: function(step){
		this.centerPanel.add(step)
	},
	
	remove_step: function(tabId){
		log.debug('the old tab is: ' + tabId)
		var tab = this.centerPanel.child(tabId)
		if(tab){ 
			//remove tracked item 
			var itemarray = tab.items.items
			if(itemarray){
				for(var i = 0; i < itemarray.length; i++){
					var name = itemarray[i].name
					if(name){
						if(this.returnedVariable[name]){
							this.returnedVariable[name] = undefined
							log.debug('item removed from return list', this.logAuthor)
						}
					}
				}
			}

			this.centerPanel.remove(tab)
			log.debug('old tab remove',this.logAuthor)
		} else {
			log.debug('no old tab found, do nothing',this.logAuthor)
		}
	},
	
	//take a list of step and build them all
	build_step_list : function(step_list){
		log.debug("Building step list",this.logAuthor)
		var formated_steps = []
		
		//Prepare each step
		for(var i = 0; i < step_list.length; i++){
			var formated_step = this.build_step(step_list[i],i)
			formated_steps.push(formated_step)
		}
		
		//now it's generated, add to panel
		return formated_steps
	},
	
	//take one step and build it
	build_step : function(raw_step, i){
		log.debug("    Building steps",this.logAuthor)
		var step = {}
		step.items = []
		
		//if not title, not generat it
		if(raw_step.title){
			//log.dump(raw_step.title)
			step.title = raw_step.title
		} else {
			step.title = "step " + i
		}
		
		if(raw_step.id){
			step.id = raw_step.id
		}
		
		if(raw_step.description){
			step.items.push({xtype: 'panel' ,html : raw_step.description, border : false})
		}
		
		//if step has items, build then, otherwise -> do nothing on step
		if(raw_step.items){
			var formated_items = this.build_items(raw_step.items)
			step.items.push(formated_items)
		}

		return step
	},
	
	//take step items, create Ext component and return them
	build_items : function(items){
		log.debug("         Building items inside the step",this.logAuthor)
		var ext_items = []
		
		//building items one by one
		for(var i = 0; i < items.length; i++){
			var item = items[i]
			//if a variable to get back further is set
			if(item.name){
				//--------special case for combobox (need a store for it)
				if((item.xtype == 'combobox') || (item.xtype == 'combo')){
					if(item.store){
						var ext_component = Ext.createByAlias(this.get_extjs_class(item.xtype),item)
					}else{
						//this.set_combobox()
						//DEBUG TEST PURPOSE
						var ext_component = Ext.createByAlias('widget.textfield',{name:'combotest'})
					}
				}else{
					//log.debug(this.get_extjs_class(item.xtype))
					var ext_component = Ext.create(this.get_extjs_class(item.xtype),item)
				}
				
				//--------check if component created, and keep variable link if a name is set
				if (ext_component){
					this.returnedVariable[item.name] = ext_component
					//log.dump(this.returnedVariable)
					log.debug("         Added "+item.name+" variable",this.logAuthor)
					ext_items.push(ext_component)
				}else{
					log.debug("         Error into item instantiate, be carefull",this.logAuthor)
				}
			} else {
				ext_items.push(item)
			}
		}
		return ext_items
	},
	
	get_extjs_class : function(name){
		if(name.indexOf('.') != -1){
			return name
		} else {
			return 'widget.'+name
		}
	},
	
	//get one item of the tracked list
	get_one_item : function(name){
		if (this.returnedVariable[name]){
			return this.returnedVariable[name]
		} else {
			return false
		}
	},
	
	//return false is no variable in object
	get_variables : function(){
		//log.dump(this.returnedVariable)
		if(this.returnedVariable){
			var returnValues = {}
			log.debug(this.returnedVariable)
			for(var i in this.returnedVariable){
				//if was not deleted
				if(this.returnedVariable[i]){
					var item = this.returnedVariable[i]
					//log.dump(item)
					var name = i
					//check item type
					if((item.xtype == 'grid') || (item.xtype == 'gridpanel')){
						returnValues[name] = item.getSelectionModel().getSelection()[0]
					} else {
						returnValues[name] =  item.getValue()
					}
				}
			}
			log.dump(returnValues)
			return returnValues
		}
		return false
	},
	
	set_combobox : function(){
		log.debug('combobox without store, this specific case is not managed',this.logAuthor)
	},
	
	/* this function provide a simple way to pilot the wizard
	 * just set this.change_step = {itemName : '',event : '', functionName :}
	 * the action bind the event to an item tracked by the wizard in 
	 * this.returnedVariable*/

	bind_panel_events : function(event_list){
		for(var i in event_list){
			var itemSource = event_list[i].itemSource
			var _function = event_list[i]._function
			var event = event_list[i].event
			/*log.debug('---------------binding system--------------')
			log.dump(itemSource)
			log.dump(_function)
			log.dump(event)
			log.dump(this.returnedVariable)
			log.debug('-------------------------------------------') */
			this.get_one_item(itemSource).on(event,_function,this)
		}
	},
	 
	
	
	//----------------------button action functions-----------------------
	previous_button: function(){
		log.debug('previous button',this.logAuthor)
		panel = this.centerPanel
		active_tab = this.centerPanel.getActiveTab()
		panel.setActiveTab(panel.items.indexOf(active_tab) - 1)
	},
	
	next_button: function(){
		log.debug('next button',this.logAuthor)
		panel = this.centerPanel
		active_tab = this.centerPanel.getActiveTab()
		panel.setActiveTab(panel.items.indexOf(active_tab) + 1)
	},
	
	cancel_button: function(){
		log.debug('cancel button',this.logAuthor)
		this.destroy()
	},
	
});

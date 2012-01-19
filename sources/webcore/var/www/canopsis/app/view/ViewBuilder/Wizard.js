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
Ext.define('canopsis.view.ViewBuilder.Wizard' ,{
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
	
	step_list: [{
			title: "i'm empty !",
			html: 'you must give an object to fill me'
		}],
	
	bbar : [{xtype:'button',text:_('previous'),action:'previous'},
			{xtype:'button',text:_('next'),action:'next'},'->',
			{xtype:'button',text:_('cancel'),action:'cancel'},
			{xtype:'button',text:_('finish'),disabled:true,action:'finish'}],
	
	initComponent: function() {
		this.logAuthor = this.id
		log.debug('Create Wizard "' + this.title + '"' ,this.logAuthor)
		this.callParent(arguments);
		
		//---------------build the window content---------------
		this.centerPanel = this.add({
			layout: 'fit',
			xtype: 'tabpanel',
		})
		if(this.step_list){
			var tmp = this.build_step_list(this.step_list)
			log.debug("Wizard steps fully generated",this.logAuthor)
			log.dump(tmp)
			this.centerPanel.add(tmp)
			
			log.debug("Wizard steps added",this.logAuthor)
		}
		
		
		
	},
	
	afterRender : function(){
		//needed, otherwize window z-index is not set/controlled
		this.callParent(arguments);
		this.centerPanel.setActiveTab(0)
		this.bind_buttons()
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
		//---------------------finish button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=finish]')
		for (i in btns){
			btns[i].on('click', this.finish_button, this)
		}
	},
	
	add_new_step: function(step){
		this.centerPanel.add(step)
	},
	
	//take a list of step and build them all
	build_step_list : function(step_list){
		log.debug("Building step list",this.logAuthor)
		var formated_steps = []
		
		//Prepare each step
		for(var i = 0; i < step_list.length; i++){
			var formated_step = this.build_step(step_list[i])
			formated_steps.push(formated_step)
		}
		
		//now it's generated, add to panel
		return formated_steps
	},
	
	//take one step and build it
	build_step : function(raw_step){
		log.debug("    Building steps",this.logAuthor)
		var step = {}
		step.items = []
		
		//if not title, not generat it
		if(raw_step.title){
			step.title = raw_step.title
		} else {
			step.title = "step " + i
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
		}
		
		ext_items = items
		return ext_items
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
	
	finish_button: function(){
		log.debug('finish button',this.logAuthor)
	},
	
});

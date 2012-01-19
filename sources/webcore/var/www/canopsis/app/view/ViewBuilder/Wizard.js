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
			this.build_steps(this.step_list)
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
	
	build_steps : function(list){
		log.debug("Building steps",this.logAuthor)
		var formated_steps = []
		for(var i = 0; i < list.length; i++){
			formated_steps.push(this.build_steps_items(list[i]))
		}
		this.centerPanel.add(formated_steps)
	},
	
	build_steps_items : function(items){
		log.debug("     Building items inside the step",this.logAuthor)
		var ext_items = []
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

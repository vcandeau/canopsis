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
	closable: false,
	closeAction: 'destroy',
	width: 600,
	minWidth: 350,
	height: 500,
	layout: 'fit',
	bodyStyle: 'padding: 5px;',
	
	
	step_list: [{
			title: _("i'm empty !"),
			html: _('you must give an object to fill me')
		}],

	initComponent: function() {
		this.logAuthor = '[Wizard '+ this.id+']'
		log.debug('Create Wizard "' + this.title + '"' ,this.logAuthor)
		
		
		//-----------------buttons--------------------------
		
		this.bbar = Ext.create('Ext.toolbar.Toolbar')

		this.cancelButton = this.bbar.add({xtype:'button',text:_('Cancel'),action:'cancel',iconCls:'icon-cancel'})
		this.bbar.add('->')
		this.previousButton = this.bbar.add({xtype:'button',text:_('Previous'),action:'previous',disabled:true,iconCls:'icon-previous'})
		this.nextButton = this.bbar.add({xtype:'button',text:_('Next'),action:'next',disabled:true,iconCls:'icon-next',iconAlign:'right'})

		this.finishButton = this.bbar.add({xtype:'button',text:_('Finish'),action:'finish',iconCls: 'icon-save',iconAlign:'right'})
		
		this.callParent(arguments);
		
		//---------------build the window content---------------
	
		//---------tab panel----------
		this.tabPanel = this.add({
			layout: 'fit',
			xtype: 'tabpanel',
			plain: true,
			deferredRender: false,
		})
		
		if(this.step_list){
			//var tmp = this.build_step_list(this.step_list)
			log.debug("Wizard steps fully generated",this.logAuthor)
			for(var i in this.step_list){
				this.add_new_step(this.step_list[i])
			}
		}

		this.previousButton.setDisabled(true)
	},
	
	afterRender : function(){
		//needed
		this.callParent(arguments);
		this.tabPanel.setActiveTab(0)
		this.bind_buttons()
		
		//bind combobox
		

		if(this.data){
			this.loadData()
		} else {
			var combo = Ext.ComponentQuery.query('#' + this.id + ' [name=xtype]')
			combo[0].on('select',this.add_option_panel,this)
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
		//---------------------finish button-------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=finish]')
		for (i in btns){
			btns[i].on('click', this.finish_button, this)
		}
		
		this.tabPanel.on('tabchange',this.update_button,this)
	},
	
	add_new_step: function(step){
		log.debug('Dumping step before adding')
		log.dump(step)
		step.bodyPadding = 10

		//adding some style
	/*	var items = step.items
		for(var i in items){
			var item = items[i]
			item.padding = 5
			item.marging = 5
			item.border = false
		}*/
		//adding to center panel
		this.tabPanel.add(step)
	},
	
	loadData : function(){
		if(this.data.xtype){
			var combo = Ext.ComponentQuery.query('#' + this.id + ' [name=xtype]')

			combo[0].setValue(this.data.xtype)
			this.add_option_panel()
			combo[0].setDisabled(true)
		}
		
		var ext_element = Ext.ComponentQuery.query('#' + this.id + ' [name]')

		for(var i in ext_element){
			var elem = ext_element[i]
			if(this.data[elem.name]){
				elem.setValue(this.data[elem.name])
			}
		}
	},

	reset_steps : function(){
		var tab_childs = this.tabPanel.items.items
		var tab_length = tab_childs.length
		
		//log.debug('child panel : ' + tab_length)
		//log.debug('step list length :' + this.step_list.length)
		
		for(var i = this.step_list.length ; i < tab_length; i++){
			this.tabPanel.remove(tab_childs[i])
		}
	},
	
	

	get_variables : function(){
		var output = {}
		var ext_element = Ext.ComponentQuery.query('#' + this.id + ' [name]')
		for (var i in ext_element){
			var name = ext_element[i].name
			var value = ext_element[i].getValue()
			output[name] = value
		}
		return output
	},

	add_option_panel : function() {
		this.reset_steps()
		var combo = Ext.ComponentQuery.query('#' + this.id + ' [name=xtype]')
		if(combo[0].isValid()){
			var store = combo[0].getStore()
			var record = store.findRecord('xtype',combo[0].getValue())
			var options = record.get('options')
			log.debug('the selected widget have the following options',this.logAuthor)
			log.dump(options)
			if(options){
				for(var i in options){
					this.add_new_step(options[i])
				}
			}
			this.update_button()
		}
	},
	
	
	//----------------------button action functions-----------------------
	previous_button: function(){
		log.debug('previous button',this.logAuthor)
		panel = this.tabPanel
		active_tab = this.tabPanel.getActiveTab()
		panel.setActiveTab(panel.items.indexOf(active_tab) - 1)
		this.update_button()
	},
	
	next_button: function(){
		log.debug('next button',this.logAuthor)
		
		var panel = this.tabPanel
		var active_tab = panel.getActiveTab()
		var index = panel.items.indexOf(active_tab)
		
		panel.setActiveTab(index + 1)
		this.update_button()
	},

	update_button:function(){
		var activeTabIndex = this.tabPanel.items.findIndex('id', this.tabPanel.getActiveTab().id)
		var tabCount = this.tabPanel.items.length;

		if(activeTabIndex == 0){
			this.previousButton.setDisabled(true)
		} else {
			this.previousButton.setDisabled(false)
		}
		
		if(activeTabIndex == (tabCount - 1)){
			this.nextButton.setDisabled(true)
			this.finishButton.setDisabled(false)
		} else {
			this.nextButton.setDisabled(false)
			this.finishButton.setDisabled(true)
		}
	},
	
	cancel_button: function(){
		log.debug('cancel button',this.logAuthor)
		this.fireEvent('cancel')
		this.close()
	},
	
	finish_button: function(){
		log.debug('save button',this.logAuthor)
		var variables = this.get_variables()
		log.debug(variables)
		this.fireEvent('save', variables)
		this.close()
	},
	
});

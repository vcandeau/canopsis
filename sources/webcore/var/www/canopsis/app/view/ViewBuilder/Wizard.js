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

	title: 'Layout Window',
	closable: true,
	closeAction: 'destroy',
	width: 600,
	minWidth: 350,
	height: 350,
	layout: 'fit',
	bodyStyle: 'padding: 5px;',
	
	logAuthor: 'Wizard',
	
	step_list: [{
			title: 'step 1',
			html: 'Hello world 1'
		}, {
			title: 'step 2',
			html: 'Hello world 2'
		}],
	
	bbar : [{xtype:'button',text:_('previous'),action:'previous'},
			{xtype:'button',text:_('next'),action:'next'},'->',
			{xtype:'button',text:_('cancel'),action:'cancel'},
			{xtype:'button',text:_('finish'),disabled:true,action:'finish'}],
	
	initComponent: function() {
		log.debug("Create Wizard" + this.id,this.logAuthor)
		this.callParent(arguments);
		
		//---------------build the window content---------------
		this.centerPanel = this.add({
			layout: 'fit',
			xtype: 'tabpanel',
		})
		if(this.step_list){
			this.centerPanel.add(this.step_list)
		}
	},
	
	afterRender : function(){
		//needed, otherwize window z-index is not set/controlled
		this.callParent(arguments);
		this.bind_buttons()
	},
	
	
	bind_buttons: function(){
		log.debug("binding buttons",this.logAuthor)
		//---------------------previous button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=previous]')
		log.dump(btns)
		for (i in btns){
			btns[i].on('click', this.test, this)
		}
		//---------------------next button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=next]')
		log.dump(btns)
		for (i in btns){
			btns[i].on('click', this.test, this)
		}
		//---------------------cancel button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=cancel]')
		log.dump(btns)
		for (i in btns){
			btns[i].on('click', this.test, this)
		}
		//---------------------finish button--------------------
		var btns = Ext.ComponentQuery.query('#' + this.id + ' [action=finish]')
		log.dump(btns)
		for (i in btns){
			btns[i].on('click', this.test, this)
		}
	},
	
	add_new_step: function(step){
		this.centerPanel.add(step)
	},
	
	//bind_buttons: 
	
	test : function(){
		log.debug('test')
	}
	
});

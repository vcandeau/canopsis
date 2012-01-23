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
	
	create_wizard: function(id){
		this.widgetWizard = Ext.create('canopsis.view.ViewBuilder.wizard')
		this.widgetWizard.show()
		var finishButton = this.widgetWizard.down('[action=finish]')
		//binding save WidgetForm save button
		finishButton.on('click', function(){this._saveWidgetForm(id)},this)
	},
	
	editWidget : function(id){
		var data = this.get_from_widget(id)
		this.widgetWizard = Ext.create('canopsis.view.ViewBuilder.wizard',{edit: true,widgetData : data})
		this.widgetWizard.show()
		log.debug(data)
	},
	
	_saveForm : function(form){
		log.debug('Saving form',this.logAuthor);
	},
	
	_saveWidgetForm : function(id){
		data = this.widgetWizard.get_variables()
		this.stock_in_widget(id,data)
		this.widgetWizard.destroy()
	},

	beforeload_EditForm: function(form){

	},
	
	stock_in_widget : function(id,data){
		log.debug('stock data in widget',this.logAuthor);
		this.form.jqDraggable.set_data(id,data)
	},
	
	get_from_widget : function(id){
		return this.form.jqDraggable.get_data(id)
	},

	afterload_EditForm: function(form){

	},
	
	afterload_DuplicateForm: function(form){

	}


});

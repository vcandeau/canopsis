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
Ext.define('canopsis.view.ViewBuilder.Form' ,{
	extend: 'Ext.panel.Panel',

	alias : 'widget.ViewBuilderForm',
	//id : 'ViewBuilderForm',
	border: 0,
	
	layout : 'fit',
	
	autoScroll: true,

	tbar: [{
		iconCls: 'icon-save',
		text: _('Save'),
		action : 'save',
	},{
		iconCls: 'icon-cancel',
		text: _('Cancel'),
		action: 'cancel',
	}
	],
	
	//-----------------------------------------------------------------------------------
	
	initComponent: function() {
		this.on('beforeclose', this.beforeclose)
		this.on('afterrender', this.afterrender, this)
		
		//-----------top bar------------
		this.saveButton = Ext.create('Ext.Button', {
								iconCls: 'icon-save',
								text: _('Save'),
								action : 'save',
							})
							
		this.cancelButton = Ext.create('Ext.Button', {
								iconCls: 'icon-cancel',
								text: _('Cancel'),
								action: 'cancel',
							})
/*				
		this.addWidgetButton = Ext.create('Ext.Button', {
								iconCls: 'icon-add',
								text: _('tmp button'),
								action: 'addWidget',
							})
*/						
		this.addColumn = Ext.create('Ext.Button', {
								iconCls: 'icon-add',
								text: _('Add column'),
								action: 'addColumn',
							})
		
		this.addRow = Ext.create('Ext.Button', {
								iconCls: 'icon-add',
								text: _('Add row'),
								action: 'addRow',
							})
							
		this.viewName = Ext.create('Ext.form.field.Text', {
								//iconCls: 'icon-add',
								//text: _('Add row'),
								fieldLabel : _("view's name"),
								allowBlank: false
								//action: 'addRow',
							})	
							
		this.reporting = Ext.create('Ext.form.field.Checkbox',{
								boxLabel  : _('Reporting') + ' :',
								name      : 'reporting',
								boxLabelAlign : 'before'
							})
							
		this.template = Ext.create('Ext.form.field.Checkbox',{
										boxLabel  : _('Template') + ' :',
										name      : 'template',
										boxLabelAlign : 'before'
									})		
		
		this.tbar =  [this.saveButton,this.cancelButton,'|',this.addColumn,this.addRow,'|',this.viewName,'|',this.reporting,this.template]
		
		//-------Context menu------
		/*this.ConfigureAction = Ext.create('Ext.Action', {
								//iconCls: 'icon-delete',
								text: _('Configurer'),
							})
							
		this.widgetAction = Ext.create('Ext.Action', {
								text: _('Widget'),
							})					

		this.contextMenu = Ext.create('Ext.menu.Menu',{
								items : [this.ConfigureAction],
							});
		*/
		this.callParent(arguments);
		
		//------jquery masonry------
		this.jqDraggable = this.add({
			xtype: 'jqGridable',
		})
	},

	afterrender: function() {
	

	},
	
	
	//-------------------------------cgrid inherited function----------------------------
	loadRecord: function(record){
	/*	widgets =  record.data.items;
		this.GlobalOptions.down('textfield[name=crecord_name]').setValue(record.get('crecord_name'));
		this.GlobalOptions.down('numberfield[name=refreshInterval]').setValue(record.get('refreshInterval'));
		this.GlobalOptions.down('numberfield[name=nbColumns]').setValue(record.get('nbColumns'));
		this.GlobalOptions.down('numberfield[name=rowHeight]').setValue(record.get('rowHeight'));
		//needed for loading node, cf ViewEditor.js controller, beforeload_EditForm function
		this.nodeId = record.get('nodeId');
		
		for (i in widgets){
					copy = Ext.ClassManager.instantiate('canopsis.model.widget',widgets[i]);
					this.ItemsStore.add(copy);
		}
*/
	},

	//------------------------------------------------------------------------------------

	beforeclose: function(tab, object){
		log.debug('[ViewEditor][cform] - Active previous tab');
		old_tab = Ext.getCmp('main-tabs').old_tab;
		if (old_tab) {
			Ext.getCmp('main-tabs').setActiveTab(old_tab);
		}
	},

	beforeDestroy : function() {
		log.debug("Destroy items ...")
		this.jqDraggable._destroy()
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.")
	},
	
});

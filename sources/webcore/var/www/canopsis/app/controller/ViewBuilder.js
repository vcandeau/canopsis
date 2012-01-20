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
	/*
	on_add_widget : function(id,widget){
		//log.dump(this)
		//log.dump(widget)
		var the_div = Ext.get(id)
		the_div.on('click',function(e){
			var container =  Ext.ComponentQuery.query('ViewBuilderForm')[0]
			container.contextMenu.showAt(e.getXY());
		})
	},
	
	_contextMenu : function(widget) {
		log.debug('Show context menu',this.logAuthor);
		log.dump(this)
		this.form.contextMenu.showAt(e.getXY());
    },
	*/
	_bindFormEvents: function(form){
		log.debug('Binding WYSIWYG editor',this.logAuthor);
		
		//form.ConfigureAction.setHandler(this._configureWidget)
		
		//form.saveButton.on('click', this._saveForm,this)
		form.addWidgetButton.on('click', this.test_wizard,this)
		//form.addWidgetButton.on('click', this.addWidget,this)
	},
	
	test_wizard: function(){
		//log.debug('clicked');
		
		var step1 = {
				title: _('Choose widget'),
				description : _('choose which widget type you want'),
				items : [{
					xtype: "grid",
					store: 'Widget',
					name: "widget",
					columns: [{
						header: _('Name'),
						dataIndex: 'name',
						flex: 1
					},{
						header: _('Description'),
						dataIndex: 'description',
						flex: 2
					}],
				}]
			}
		
		var step2 = {
				title: _('General'),
				description: _('General widget option'),
				items : [{
						xtype : 'textfield',
						fieldLabel : _('Title'),
						name : 'title'
					},{
						xtype: 'numberfield',
						fieldLabel: _('Refresh interval'),
						name: 'refreshInterval',
						value: 0,
						minValue: 0
					},{
						xtype : 'canopsis.lib.form.field.cinventory',
						multiSelect: false,
						name : 'nodeId'
					}
				]
			}
			/*
			this.globalNodeId = Ext.create('canopsis.lib.form.field.cinventory',{
								multiSelect: false,});*/
		
		//--------------------show the wizard--------------------- 
		var wizard = Ext.create('canopsis.lib.view.cwizard',{
			title : 'Widget Wizard',
			_after_step_list : function(){log.debug('******test******')},
			step_list: [ step1,
						step2],
			})
		wizard.show()
	},
	
	_configureWidget: function(widget){
		log.debug('eee')
	},
	/*
	addWidget : function(){
		//this.widgetCounter
		
		$('#sortable').append('<li id="l'+this.widgetCounter+'"><div id="b'+this.widgetCounter+'" class="ui-widget-content" style="width:100%;height:100%;">box '+this.widgetCounter+'</div></li>');
        $('#l'+this.widgetCounter).resizable({
                        grid: 50,
						minHeight: 100,
						minWidth: 100,
						handles: 'se',
						//stop: this.checkWidgetSize
        });
        this.widgetCounter++
	},
	
	checkWidgetSize : function(event,ui){
		//log.debug($('#'+ui.element.context.id).get())
		var width = $(this).width()
		var height = $(this).height()
		
		//if not right size, resize it
		if(((width%50) != 0) && ((height%50) != 0)){
			var new_width = Math.round(width/50) * 50
			var new_height = Math.round(height/50) * 50
			
			log.debug(new_width)
			log.debug(new_height)
			
			if(new_width > 100){
				new_width += ((new_width / 100)-1) * 3
			}
			if(new_height > 100){
				new_height += ((new_height / 100)-1) * 6
			}
			
			//log.debug(new_width)
			//log.debug(new_height)
			
			$(this).css({
					width: new_width,
					height: new_height
			})
		}
	},
	*/
	_addDropZone: function(){
		
	},
	
	_saveForm : function(form){
		
	},

	beforeload_EditForm: function(form){

	},
	

	afterload_EditForm: function(form){

	},
	
	afterload_DuplicateForm: function(form){

	}


});

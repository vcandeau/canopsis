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
	/*	$(function() {
                $( "#sortable" ).sortable({
						placeholder: "ui-sortable-placeholder",
						//forcePlaceholderSize: false,
						opacity: 0.4,
						start: function(e, ui){
							ui.placeholder.height(ui.item.height());
							ui.placeholder.width(ui.item.width());
						}
					});
                $( "#sortable" ).disableSelection();
        });*/
        
        $(function() {
			$("#container").jqGridable()
         });
		this._bindFormEvents(this.form)
		
	},
	
/*	_contextMenu : function(view, rec, node, index, e) {
		log.debug('Show context menu',this.logAuthor);
		e.stopEvent();
		this.form.contextMenu.showAt(e.getXY());
    },*/
	
	_bindFormEvents: function(form){
		log.debug('Binding WYSIWYG editor',this.logAuthor);
	
		//form.saveButton.on('click', this._saveForm,this)
		//form.addWidgetButton.on('click', this.addWidget,this)
	},
	
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

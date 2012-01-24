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

Ext.define('Ext.jq.Gridable' ,{
	extend: 'Ext.container.Container',
	alias: 'widget.jqGridable',
	
	debug: false,
	columns: 5,
	show_grid: true,
	widget_margin: 5,
	widget_list: [],
	
	draggable: true,
	resizable:  true,
	selectable: true,
	
	container: undefined,
	border: false,
	
	items: [],
	
	initComponent: function() {
		this.html = '<div id="'+this.id+'-container" style="height: 100%;"></div>'
		this.callParent(arguments)
	},
	
	afterRender: function() {
		this.container = $("#"+this.id+'-container').jqGridable({
				columns: this.columns,
				margin: this.widget_margin,
				debug: this.debug,
				show_grid: this.show_grid,
				draggable: this.draggable,
				resizable:  this.resizable,
				selectable: this.selectable,
				on_resize_widget: this._on_resize_widget,
				on_add_widget: $.proxy(this._on_add_widget,this),
				on_widget_dblclick: $.proxy(this._on_widget_dblclick,this),
				tpl_widget: "<div id='[id]-content'></div>",
		});
		
	},
	
	_on_resize_widget: function(id, jqwidget){
		var item = Ext.getCmp(id+'-extcmp')
		item.height = $("#"+id).height() - this.margin * 2
		item.doLayout()
	},
	
	set_data: function(id, data){
		//if (this.container){
			$("#"+this.id+'-container').jqGridable('widget_setData', id, data)
		//}
	},
	
	get_data: function(id){
		//if (this.container){
			return $("#"+this.id+'-container').jqGridable('widget_getData', id)
		//}
	},
	
	add_column: function(){
		$("#"+this.id+'-container').jqGridable('addColumn')
		log.debug(this)
		this._refresh_widget_layout()
	},
	
	add_row: function(){
		$("#"+this.id+'-container').jqGridable('addRow')
		this._refresh_widget_layout()
	},
	
	_on_widget_dblclick : function(widget){
		var id = $(widget).attr('id')
		this.fireEvent('dblclickWidget',id)
	},

	_on_add_widget: function(id, jqwidget){
		var div = Ext.create('Ext.panel.Panel', {
			id: id+'-extcmp',
			html_id: id,
			layout:'fit',
			margin: this.widget_margin,
			renderTo: id+'-content',
			title: id,
			height: $("#"+id).height() - this.widget_margin * 2,
		});
		this.widget_list.push(div)
		this.fireEvent('widgetAdd',id)
	},

	_refresh_widget_layout: function(){
		for(var i in this.widget_list){
			var widget = this.widget_list[i]
			widget.height = $("#"+widget.html_id).height() - this.widget_margin * 2
			widget.doLayout()
		}
		
	},
	
	_dump :function(){
		var dump = $("#"+this.id+'-container').jqGridable('dump')
	/*	//delete jquery irrevelant information
		for(i in dump){
			if (dump[i].data['draggable']){
				delete dump[i].data['draggable']
			}
			if (dump[i].data['resizable']){
				delete dump[i].data['resizable']
			}
			if (dump[i].data['selectableItem']){
				delete dump[i].data['selectableItem']
			}
			log.debug(dump[i].data.indexOf('jquery'))
		}*/

		return dump
	},
	
	_load : function(data){
		$("#"+this.id+'-container').jqGridable('load', data)
	},
	
	_destroy : function(){
		log.debug('######################################')
		$("#"+this.id+'-container').jqGridable('clear')
	},

});

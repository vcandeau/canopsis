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
Ext.define('canopsis.view.Tabs.JqGridableViewer' ,{
	extend: 'Ext.jq.Gridable',
	alias : 'widget.JqGridableViewer',
	
	show_grid: false,
	draggable: false,
	resizable:  false,
	selectable: false,
	debug: false,
	
	cls_jqGridable_widget_handle: '.x-panel-header',
	
	logAuthor: '[view][tabs][content][jqGridable]',
	
	initComponent: function() {
		this.callParent(arguments)
		this.widget_list = []
	},
	
	_on_add_widget: function(event, options, id, jqwidget){
		log.debug("[jqGridable] - on add widget")
		var div = Ext.create('Ext.panel.Panel', {
			id: id+'-extcmp',
			border : false,
			layout:'fit',
			margin: this.widget_margin,
			renderTo: id+'-content',
			//title: id,
			height: $("#"+id).height() - (this.widget_margin * 2)
		});
		this.widget_list.push(div)
		this.fireEvent('widgetAdd',id)
	},

	pause_widgets : function(){
		log.debug("[jqGridable] - pause widgets")
		for(var i in this.widget_list){
			log.dump(this.widget_list[i])
			this.widget_list[i].items.items[0].setDisabled(true)
		}
	},
	
	_on_widget_dblclick : function(event, options,id,widget){
		this.fireEvent('widgetDblclick',widget)
	},
	
})

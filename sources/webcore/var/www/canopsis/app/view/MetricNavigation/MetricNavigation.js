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

Ext.define('canopsis.view.MetricNavigation.MetricNavigation', {
	extend: 'Ext.panel.Panel',
	
	alias: 'widget.MetricNavigation',
	
	initComponent: function() {
		
		//create cinventory
		var tab1 = Ext.create('canopsis.lib.form.field.cinventory',{title:_('select metrics'),vertical_multiselect:true})
		
		//set items
		var items = [{
			xtype:'tabpanel',
			region:'west',
			width: 550,
			collapsible: true,
			collapseDirection: 'left',
			items:[tab1,{title:'sample2'}],
		},{
			xtype:'panel',
			region:'center',
			layout: 'column',
			title:'renderPanel',
			items : [
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
					]
		}]
		
		var masterpanel = Ext.create('Ext.panel.Panel',{layout:'border',items:items})
		
		//building layout
		this.items = [masterpanel]
		this.callParent(arguments);
	},
	
	
	
})

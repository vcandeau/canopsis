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
		
		//create toolbar button
		var toolbar = Ext.create('Ext.toolbar.Toolbar')
		
		this.buttonCancel = toolbar.add({
			xtype: 'button', 
			text: _('Cancel'),
			action: 'cancel'
		})
		
		this.buttonDisplay = toolbar.add({
			xtype: 'button', 
			text: _('Display'),
			action: 'display'
		})
		
		//create config panel
		var config_tabPanel = {
			region:'west',
			width: 550,
			border: false,
			collapsible: true,
			collapseDirection: 'left',
			bbar: toolbar,
			items:[tab1,{title:'sample2'}]
		}
		this.tabPanel = Ext.create('Ext.tab.Panel',config_tabPanel)
		
		//create render panel
		config_renderPanel = {
			region:'center',
			layout: 'column',
			title:'renderPanel',
			//border: '0 1 1 1',
			items : [
			/*			{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	
						{xtype:'panel',width:350,height:200,border:4},	*/
					]
		}
		this.renderPanel = Ext.create('Ext.panel.Panel',config_renderPanel)
		
		//---------------------building layout----------------------------------
		
		var masterpanel = Ext.create('Ext.panel.Panel',{layout:'border',items:[this.tabPanel,this.renderPanel]})
		
		
		this.items = [masterpanel]
		this.callParent(arguments);
	},
	
	
	
})

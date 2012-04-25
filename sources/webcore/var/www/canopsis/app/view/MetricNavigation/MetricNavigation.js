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
	extend: 'Ext.form.Panel',
	
	alias: 'widget.MetricNavigation',
	
	layout: 'border',
	
	initComponent: function() {
		//first tab element
		var config = {
			region:'west',
			width:400,
			collapsible: true,
			collapseDirection: 'left',
			
			items:[{title:'sample'},{title:'sample2'}]
			
		}
		
		tabPanel = Ext.create('Ext.tab.Panel',config)
		renderPanel = Ext.create('Ext.panel.Panel',{region:'center'})
		//panel
		this.items = [tabPanel,renderPanel]
		
		this.callParent(arguments);
	},
	
	
	
})

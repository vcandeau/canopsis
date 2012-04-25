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
Ext.define('canopsis.view.ReportingBar.ReportingBar' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.ReportingBar',
	
	dock: 'top',
	
	//false to prevent reloading after choosing date/duration
	reloadAfterAction: false,
	
	initComponent: function() {
		this.callParent(arguments);
		
		//---------------------- Create items --------------------------------
		
		var comboStore = Ext.create('Ext.data.Store', {
			fields: ['name', 'value'],
			data : [
				{"name":_("Day"), "value":global.commonTs.day},
				{"name":_("Week"), "value":global.commonTs.week},
				{"name":_("Month"), "value":global.commonTs.month},
				{"name":_("Year"), "value":global.commonTs.year}
			]
		});
		
		comboStore.load();
		
		this.combo = this.add({
			xtype: 'combobox',
			store: comboStore,
			queryMode: 'local',
			editable:false,
			displayField: 'name',
			width:70,
			valueField: 'value',
			forceSelection : true,
			value : _('Day')
		});
		
		this.combo.setValue(86400)
		
		this.add({ xtype: 'tbspacer', width: 20 })
		
		this.previousButton = this.add({
			xtype: 'button', 
			cls: 'x-btn-icon x-tbar-page-prev',
			action: 'previous'
		})
		
		var today = new Date()
		var tommorow = new Date(today.getTime() + (global.commonTs.day * 1000))
		
		this.currentDate = this.add({
			xtype: 'datefield',
			name: 'from',
			editable: false,
			width: 110,
			value: today,
			maxValue: tommorow,
		})
		
		this.nextButton = this.add({
			xtype: 'button', 
			cls: 'x-btn-icon x-tbar-page-next',
			action: 'next'
		})
		
		this.add({ xtype: 'tbspacer', width: 15 })

		if(this.reloadAfterAction == false){
			this.requestButton = this.add({
				xtype: 'button', 
				iconCls: 'icon-reload',
				tooltip: _('Refresh'),
				action: 'request'
			})
		}
		
		this.saveButton = this.add({
			xtype: 'button', 
			iconCls: 'icon-save',
			action: 'save',
			tooltip: _('Export this view to pdf')
		})
		
		this.linkButton = this.add({
			xtype: 'button', 
			iconCls: 'icon-page-html',
			action: 'link',
			tooltip: _('View page in html')
		})
		
		this.exitButton = this.add({
			xtype: 'button', 
			iconCls: 'icon-close',
			action: 'exit',
			tooltip: _('Leave reporting mode')
		})
	}
	
});

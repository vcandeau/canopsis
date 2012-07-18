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
Ext.define('canopsis.view.ReportingBar.ReportingBar' , {
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.ReportingBar',

	dock: 'top',

	//false to prevent reloading after choosing date/duration
	reloadAfterAction: false,

	initComponent: function() {
		this.callParent(arguments);

		//---------------------- Create items --------------------------------

		var today = new Date();
		var tommorow = new Date(today.getTime() + (global.commonTs.day * 1000));
		var yesterday = new Date(today.getTime() - (global.commonTs.day * 1000));

		this.fromDate = this.add({
			xtype: 'datefield',
			fieldLabel: _('From'),
			labelWidth:40,
			editable: false,
			width: 130,
			value: yesterday,
			maxValue: tommorow
		});
		
		this.fromHour = this.add({
			xtype:'textfield',
			value: '00:00 am',
			width:70,
			allowBlank: false,
			regex: /^([01]?\d|2[0-3]):([0-5]\d)(\s)?(am|pm)?$/
		});
		
		this.add('-')
		
		this.toDate = this.add({
			xtype: 'datefield',
			labelWidth:30,
			fieldLabel: _('To'),
			editable: false,
			width: 130,
			value: today,
			maxValue: tommorow
		});
		
		this.toHour = this.add({
			xtype:'textfield',
			//fieldLabel: _('Hours (local time)'),
			value: '00:00 am',
			width:70,
			allowBlank: false,
			regex: /^([01]?\d|2[0-3]):([0-5]\d)(\s)?(am|pm)?$/
		});
			
		this.add('-')

		this.searchButton = this.add({
			xtype: 'button',
			iconCls: 'icon-run',
			action: 'search',
			tooltip: _('Export this view to pdf')
		});
		
		this.saveButton = this.add({
			xtype: 'button',
			iconCls: 'icon-save',
			action: 'save',
			tooltip: _('Export this view to pdf')
		});

		this.htmlButton = this.add({
			xtype: 'button',
			iconCls: 'icon-page-html',
			action: 'link',
			tooltip: _('View page in html')
		});

		this.exitButton = this.add({
			xtype: 'button',
			iconCls: 'icon-close',
			action: 'exit',
			tooltip: _('Leave reporting mode')
		});
	}

});

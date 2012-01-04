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
Ext.define('canopsis.view.Tabs.View' ,{
	extend: 'Ext.tab.Panel',
	alias : 'widget.TabsView',

	activeTab: 0, // index or id
	bodyBorder: false,
	componentCls: 'cps-headertabs',
	plain: false,

/*	items:[{
    		title: _('Dashboard'),
    		id: 'dashboard.tab',
    		view: 'anonymous-default-dashboard',
		xtype: 'TabsContent',
	}],*/

	initComponent: function() {
		this.on('afterrender', this._afterrender, this);
		this.callParent(arguments);
	},

	_afterrender: function() {
		show_dashboard()
	}
	
	/*listeners: {
		'tabchange': function(tp, p) {
		tp.doLayout();
	}*/	
	
});


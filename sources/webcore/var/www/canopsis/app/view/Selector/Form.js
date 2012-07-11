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
Ext.define('canopsis.view.Selector.Form', {
	extend: 'canopsis.lib.view.cform',

	alias: 'widget.SelectorForm',

	defaultType: undefined,

    initComponent: function() {

		this.items = [
			{
				xtype: 'tabpanel',
				height: 400,
				width: 700,
				plain: true,
				border: false,
				defaults: {
					border: false
				},
				items: [
					{
						title: _('General'),
						defaultType: 'textfield',
						bodyStyle: 'padding:5px 5px 0',
						items: [
							{
								name: '_id',
								hidden: true
							},
							{
								fieldLabel: _('Name'),
								name: 'crecord_name',
								allowBlank: false
							},{
								fieldLabel: _('Description'),
								xtype: 'textareafield',
								name: 'description'
							},{
								fieldLabel: _('SLA'),
								xtype: 'checkboxfield',
								inputValue: true,
								uncheckedValue: false,
								name: 'sla'
							},{
								xtype: 'fieldcontainer',
								fieldLabel: _('Time window'),
								layout: 'hbox',
								width: 500,
								items:[
									{
										xtype: 'numberfield',
										name: 'sla_timewindow_value',
										minValue: 1,
										value: 1,
										width: 60,
										allowBlank: false,
										padding: "0 5 0 0"
									},{
										xtype: 'combobox',
										name: 'sla_timewindow_unit',
										queryMode: 'local',
										displayField: 'text',
										width: 90,
										valueField: 'value',
										store: {
											xtype: 'store',
											fields: ['value', 'text'],
											data: [
												{value: global.commonTs.day, text: _('Day')},
												{value: global.commonTs.week, text: _('Week')},
												{value: global.commonTs.month, text: _('Month')},
												{value: global.commonTs.year, text: _('Year')}
											]
										}
									}
								]
							},{
								fieldLabel: _('Consider unknown time'),
								xtype: 'checkboxfield',
								inputValue: true,
								uncheckedValue: false,
								name: 'sla_timewindow_doUnknown'
							},{
								xtype: 'numberfield',
								fieldLabel: _('Warning threshold'),
								name: 'thd_warn_sla_timewindow',
								minValue: 1,
								maxValue: 100,
								allowBlank: false
							},{
								xtype: 'numberfield',
								fieldLabel: _('Critical threshold'),
								name: 'thd_crit_sla_timewindow',
								minValue: 1,
								maxValue: 100,
								allowBlank: false
							}
						]
					},{
						title: _('Include'),
						name: 'include_ids',
						xtype: 'cinventory'
					},{
						title: _('Exclude'),
						name: 'exclude_ids',
						xtype: 'cinventory'
					},{
						title: _('Filter'),
						xtype: 'cfilter',
						name: 'mfilter'
					}
				]
			}
		];

        this.callParent();
    }

});

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
				xtype: "tabpanel",
				height: 400,
				width: 700,
				plain: true,
				border: false,
				defaults: {
					border: false,
				},
				items: [
					{
						title: _("General"),
						defaultType: 'textfield',
						bodyStyle: 'padding:5px 5px 0',
						items: [
							{
								fieldLabel: _('Name'),
								name: 'crecord_name',
								allowBlank: false
							},{
								fieldLabel: _('Description'),
								name: 'description'
							}
						]
					},{
						title: _("Include"),
						name :'include_ids',
						xtype: 'cinventory'
					},{
						title: _("Exclude"),
						name: 'exclude_ids',
						xtype: 'cinventory'
					},{
						title: _("Filter"),
						xtype: "textareafield",
						name: "mfilter",
						value: ""
					}
				]
			}
		];
			
        this.callParent();
    }

});

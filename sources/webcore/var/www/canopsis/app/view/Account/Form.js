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
Ext.define('canopsis.view.Account.Form', {
	extend: 'canopsis.lib.view.cform',

	alias: 'widget.AccountForm',

	iconCls: 'icon-crecord_type-account',

	items: [{
				fieldLabel: 'Login',
				name: 'user',
				allowBlank: false,
			},{
				fieldLabel: 'First Name',
				name: 'firstname',
				allowBlank : false
			}, {
				fieldLabel: 'Last Name',
				name: 'lastname',
				allowBlank : false
			},/*{
				fieldLabel: 'aaa access owner',
				name: 'aaa_access_owner'
			},*/{
				fieldLabel: 'E-mail',
				name: 'mail',
				vtype: 'email',
				allowBlank : true
			},/*{
				fieldLabel: 'groups',
				name: 'groups'
			},*/{
				fieldLabel: 'group',
				name: 'aaa_group',
				store: 'Group',
				displayField: 'crecord_name',
				xtype: 'combobox',
				allowBlank : false
			},{
				fieldLabel: 'password',
				inputType: 'password',
				name: 'passwd',
				allowBlank : false
			}/*,{
				fieldLabel: 'aaa owner',
				name: 'aaa_owner'
			}*/],
    

    initComponent: function(){
        this.callParent();
    },
    
});

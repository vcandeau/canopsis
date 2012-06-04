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
	
	logAuthor : '[Controller][Account][Form]',

	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		var g_options = [{
				fieldLabel: _('Login'),
				name: 'user',
				allowBlank: false,
				regex: /^[A-Za-z0-9_]+$/,
				regexText: _("Invalid login") + ", "+_("use alphanumeric characters only") + "<br/>([A-Za-z0-9_])"
			},{
				fieldLabel: _('First Name'),
				name: 'firstname',
				allowBlank : false
			}, {
				fieldLabel: _('Last Name'),
				name: 'lastname',
				allowBlank : false
			},{
				fieldLabel: _('E-mail'),
				name: 'mail',
				vtype: 'email',
				allowBlank : true
			},{
				fieldLabel: _('group'),
				name: 'aaa_group',
				store: 'Groups',
				displayField: 'crecord_name',
				xtype: 'combobox',
				allowBlank : false
			},{
				fieldLabel: _('password'),
				inputType: 'password',
				name: 'passwd',
				allowBlank : false
			}]
			
		
		
		var g_options_panel = Ext.widget('fieldset',{
				title:_('General options'),
				//margin : 4,
				//height : 400,
				//width : 200,
				defaultType: 'textfield',
				items : g_options
			})
		
		var secondary_group = Ext.widget('fieldset',{
				title:_('Secondary groups'),
				//margin : 4,
				//height : 400,
				//width : 200,
				//items : [g_options]
			})
		
		this.callParent(arguments);
		
		this.add(g_options_panel)
	},
    
});

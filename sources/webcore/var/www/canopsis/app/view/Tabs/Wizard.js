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

Ext.define('canopsis.view.Tabs.Wizard' , {
	extend: 'canopsis.lib.view.cwizard',

	title: _('Widget Wizard'),

	data: undefined,

	logAuthor: '[widget wizard]',

	initComponent: function() {

		//----------------------Build wizard options
		var step1 = {
				title: _('Choose widget'),
				//description : _('choose the type of widget you want, its title, and refresh interval'),
				items: [
				{
					xtype: 'combo',
					store: 'Widgets',
					forceSelection: true,
					fieldLabel: _('Type'),
					name: 'xtype',
					displayField: 'name',
					valueField: 'xtype',
					//value: 'empty',
					allowBlank: false
				},{
					xtype: 'displayfield',
					name: 'description',
					isFormField: false,
					fieldLabel: _('Description')
				},{
					xtype: 'checkbox',
					fieldLabel: _('Show border'),
					checked: false,
					name: 'border',
					uncheckedValue: false
				},{
					xtype: 'checkbox',
					fieldLabel: _('Auto title') + ' ' + _('if available'),
					checked: true,
					inputValue: true,
					uncheckedValue: false,
					name: 'autoTitle'
				},{
					xtype: 'textfield',
					fieldLabel: _('Title') + ' (' + _('optional') + ')',
					name: 'title'
				},{
					xtype: "combobox",
					name: "refreshInterval",
					fieldLabel: _('Refresh interval'),
					queryMode: "local",
					displayField: "text",
					valueField: "value",
					value: 300,
					store: {
						xtype: "store",
						fields: ["value", "text"],
						data : [
							{value: 0,			text: "None"},
							{value: 60,			text: "1 minutes"},
							{value: 300,		text: "5 minutes"},
							{value: 600,		text: "10 minutes"},
							{value: 900,		text: "15 minutes"},
							{value: 1800,		text: "30 minutes"},
							{value: 3600,		text: "1 hour"}
						]
					}
				}]
		};

		this.step_list = [step1];

		this.callParent(arguments);

	},

	cancel_button: function() {
		log.debug('cancel button', this.logAuthor);
		this.fireEvent('cancel', this.widgetId);
		this.close();
	},

	finish_button: function() {
		log.debug('save button', this.logAuthor);
		var combo = Ext.ComponentQuery.query('#' + this.id + ' [name=xtype]');
		if (combo[0].isValid()) {
			var variables = this.get_variables();

			//hack: if no xtype set it (the field is disable in editmode)
			if (variables.xtype == undefined)
				variables.xtype = combo[0].getValue();

			//log.dump('---------------------')
			//log.dump(variables)

			this.fireEvent('save', this.widgetId, variables);
			this.close();
		}
	}



});

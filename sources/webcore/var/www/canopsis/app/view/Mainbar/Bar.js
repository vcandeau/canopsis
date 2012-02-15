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
Ext.define('canopsis.view.Mainbar.Bar' ,{
	extend: 'Ext.toolbar.Toolbar',

	alias: 'widget.Mainbar',

	border: false,

	layout: {
		type: 'hbox',
		align: 'stretch',
		//padding: 5
	},

	baseCls: 'Mainbar',

	initComponent: function() {
		
		this.viewSelector = Ext.create('Ext.form.field.ComboBox', {
			hideLabel: true,
			action: 'viewSelector',
			store:  Ext.create('canopsis.store.View'),
			displayField: 'crecord_name',
			//typeAhead: true,
			queryMode: 'remote',
			triggerAction: 'all',
			emptyText: _('Select a view')+' ...',
			selectOnFocus: true,
			width: 200,
			iconCls: 'no-icon',
		});
		
		this.viewSelector.on('select',function(){
				var menu = this.down('menu[name="Run"]')
				menu.hide()
			},this)
		
		this.items = [
			{
				iconCls: 'icon-mainbar-build',
				text: _('ITIL.Build'),
				menu: {
					items: [
							{
								//iconCls: 'icon-console',
								text: _('Edit active view'),
								action: 'editView'
							},{
								//iconCls: 'icon-clear',
								text: _('New view'),
								action: 'newView'
							}
					],
				}
			},{
				iconCls: 'icon-mainbar-run',
				text: _('ITIL.Run'),
				menu: {
					name: 'Run',
					items: [
							this.viewSelector,
					],
				}
			},{
				iconCls: 'icon-mainbar-report',
				text: _('ITIL.Report')
			},'-',{
				xtype: 'container',
				html: "<div class='cps-title' >Canopsis</div>",
				flex : 1
			},/*{
				xtype : 'container',
				width : 300
			},*/{
				xtype : 'container',
				name : 'clock',
				align : 'strech',
				flex : 4
			},'->',{
				xtype: 'container',
				html: "<div class='cps-account' >"+global.account.firstname+" "+global.account.lastname+"</div>",
				flex:2.3
			},{
				iconCls: 'icon-user',
				flex : 0.2,
				menu: []

			},'-',{
				iconCls: 'icon-preferences',
				flex : 0.2,
				menu: {
					showSeparator: true,
					items: [
							{
								iconCls: 'icon-console',
								text: _('Show log console'),
								action: 'showconsole'
							},{
								iconCls: 'icon-clear',
								text: _('Clear tabs cache'),
								action: 'cleartabscache'
							},'-',{
								iconCls: 'icon-logout',
								text: _('Logout'),
								action: 'logout'
							},
						],
				}
			}
		]
		this.callParent(arguments);
	}

});

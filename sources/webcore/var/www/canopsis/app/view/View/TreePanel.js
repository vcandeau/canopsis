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
Ext.define('canopsis.view.View.TreePanel' , {
	extend: 'canopsis.lib.view.ctree',

	alias: 'widget.ViewTreePanel',

	store: 'TreeStoreViews',
	model: 'View',

	leafName: 'view',

	reporting: true,
	opt_bar_export: true,

	initComponent: function() {


		this.columns = [{
			xtype: 'treecolumn',
			text: _('Name'),
			flex: 5,
			dataIndex: 'crecord_name'
		},{
			flex: 1,
			dataIndex: 'aaa_owner',
			renderer: rdr_clean_id,
			text: _('Owner')
		},{
			flex: 1,
			dataIndex: 'aaa_group',
			renderer: rdr_clean_id,
			text: _('Group')
		},{
			width: 80,
			align: 'center',
			text: _('Owner'),
			dataIndex: 'aaa_access_owner'
		},{
			width: 60,
			align: 'center',
			text: _('Group'),
			dataIndex: 'aaa_access_group'
		},{
			width: 60,
			align: 'center',
			text: _('Others'),
			dataIndex: 'aaa_access_other'
		},{
			xtype: 'actioncolumn',
			width: 20,
			text: _('Dump'),
			icon: './themes/canopsis/resources/images/Tango-Blue-Materia/16x16/actions/gtk-indent.png',
			handler:  function(tree, rowIndex, colindex) {
				var rec = tree.getStore().getAt(rowIndex).raw;
                if(rec.crecord_type == 'view'){
					tree.fireEvent('getViewFile',rec._id)
				}
			}
		}];

		if (global.reporting == true) {
			this.columns.push({
				width: 20,
				renderer: rdr_export_button
			});
		}

		this.columns.push({
				width: 16
			});

		this.callParent(arguments);
		
		var config = {
				xtype: 'button',
				iconCls: 'icon-import',
				text: _('Import view'),
				disabled: false,
				action: 'import'
			}
		this.dockedToolbar.add(config)

	},

	export_pdf: function(view) {
		this.fireEvent('exportPdf', view);
	}

});

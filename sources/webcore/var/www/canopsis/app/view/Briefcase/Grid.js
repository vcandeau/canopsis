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
Ext.define('canopsis.view.Briefcase.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	alias: 'widget.BriefcaseGrid',

	model: 'Document',
	store : 'Document',	
	
	opt_bar_add:false,
	opt_view_element : true,
	opt_bar_download: true,
	
	columns: [
		{
			header: _('time'),
			flex: 1,
			sortable: true,
			dataIndex: 'crecord_write_time',
			renderer : rdr_tstodate,
		},{
			header: _('Name'),
			flex: 1,
			sortable: true,
			dataIndex: 'file_name',
		},{
			header: _('id'),
			flex: 1,
			sortable: true,
			dataIndex: '_id',
		}
	],

	initComponent: function() {
		this.callParent(arguments);
	},
	
	
})
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
Ext.define('canopsis.view.ViewEditor.View' ,{
	extend: 'canopsis.lib.view.cgrid',

	alias : 'widget.ViewEditor',
	
	model: 'view',
	store: 'View',
	
	multiSelect: true,

	opt_duplicate: true,
	opt_tbar_duplicate: true,
	
	opt_tbar_search: true,
	opt_tbar_search_field: ['crecord_name','_id'],
	   
	columns: [{
			header: 'name',
			flex: 2,
			sortable: true,
			dataIndex: 'crecord_name',
		},{
			header: 'id',
			flex: 2,
			sortable: true,
			dataIndex: 'id',
		}],	
			
});

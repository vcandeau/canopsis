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
Ext.define('canopsis.view.Account.Grid' ,{
	extend: 'canopsis.lib.view.cgrid',

	controllerId: 'Account',

	alias: 'widget.AccountGrid',

	model: 'Account',
	store : 'Account',	

	opt_grouping: true,
	opt_paging: true,
	opt_menu_delete: true,

	columns: [
		{
                	header: '',
	                width: 25,
	                sortable: false,
			renderer: rdr_crecord_type,
	                dataIndex: 'crecord_type',
        	},{
        	        header: 'Login',
	                flex: 2,
	                sortable: true,
                	dataIndex: 'user',
		},{
	                header: 'First name',
	                flex: 2,
	                sortable: false,
                	dataIndex: 'firstname',
		},{
	                text: 'Last name',
	                flex : 2,
	                sortable: false,
	                dataIndex: 'lastname',
		},{
                	header: 'email',
	                flex: 2,
	                sortable: false,
                	dataIndex: 'mail',
		},{
	                header: 'group',
	                flex: 2,
	                sortable: false,
	                dataIndex: 'aaa_group',
        	},/*{
                	header: 'groups',
	                flex: 2,
	                sortable: false,
	                dataIndex: 'groups',
		}*/
            
	],

	initComponent: function() {
		this.callParent(arguments);
	}

});

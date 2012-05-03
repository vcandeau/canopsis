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
Ext.define('canopsis.model.Task', {
	extend: 'Ext.data.Model',	
	fields: [
		{name: '_id'},
		{name: 'id', mapping:'_id'},
		{name : 'crecord_type', defaultValue: 'schedule'},
		{name : 'func_ref'},
		{name : 'loaded', defaultValue:false},
		{name : 'crecord_name'},
		{name : 'args', defaultsValue : []},
		{name : 'kwargs' ,defaultsValue : {}},
		//{name : 'date', defaultValue: undefined},
		//{name : 'interval', defaultValue: undefined},
		{name : 'cron', defaultValue: undefined},
		{name : 'log'},
		{
			name : 'log_success',
			convert : function(value, record) {return record.get('log').success}
		},
		{
			name : 'log_output',
			convert : function(value, record) {return record.get('log').output}
		},
		{
			name : 'log_last_execution',
			convert : function(value, record) {return record.get('log').timestamp}
		},		
		{
		 name: 'mail',
		 convert: function(value, record) {
					var kwargs = record.get('kwargs')
					if(kwargs['mail'] != undefined){
						var mail = kwargs['mail']
						return true
					}else{
						return false
					}
				}
		},
		
		{name: 'aaa_access_group'},
		{name: 'aaa_access_other'},
		{name: 'aaa_access_owner'},
		{name: 'aaa_group'},
		{name: 'aaa_owner'},
	],
});

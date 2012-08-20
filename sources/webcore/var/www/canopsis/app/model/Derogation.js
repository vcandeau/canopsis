/*
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
Ext.define('canopsis.model.Derogation', {
    extend: 'Ext.data.Model',
    idProperty: '_id',
    fields: [
		{name: '_id'},
		{name: 'output_tpl'},
		{name: 'startTs'},
		{name: 'stopTs',defaultValue: undefined},
		{name: 'crecord_name',defaultValue: undefined},
		{name: 'alert_icon',defaultValue: undefined},
		{name: 'state',defaultValue: undefined},
		{name: 'alert_msg',defaultValue: undefined},

		{name: 'aaa_access_group'},
		{name: 'aaa_access_other'},
		{name: 'aaa_access_owner'},
		{name: 'aaa_group'},
		{name: 'aaa_owner'}
	]
});

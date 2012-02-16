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
Ext.define('canopsis.controller.Keynav', {
	extend: 'Ext.app.Controller',

	logAuthor: '[controller][Keynav]',

	init: function() {
		this.map = Ext.create('Ext.util.KeyMap', Ext.getBody(), [
			{
				key: Ext.EventObject.N,
				shift: true,
				ctrl: false,
				fn: function() {
					// New view
					log.debug('shift + n', this.logAuthor)
				}
			},{
				key: Ext.EventObject.E,
				shift: true,
				ctrl: false,
				fn: function() {
					// Edit view
					log.debug('shift + e', this.logAuthor)
				}
			},{
				key: Ext.EventObject.S,
				shift: true,
				ctrl: false,
				fn: function() {
					// Save view
					log.debug('shift + s', this.logAuthor)
				}
			}
		]);
		
		this.callParent(arguments);
	},

});

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

Ext.define('canopsis.lib.form.field.cfilter' ,{
	extend: 'Ext.panel.Panel',
	
	alias: 'widget.cfilter',
	
	height : 400,
	
	layout: {
        type: 'vbox',
        align: 'stretch'
    },
	
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		this.build_stores()

		this.callParent(arguments);
	},
	
	build_stores : function(){
		log.debug('Build stores', this.logAuthor)
		
		//---------------------field store-------------------
		this.field_store = Ext.create('Ext.data.Store', {
			fields : ['value','text'],
			data: [
				{'value':'crecord_type','text':'Record type'}

			]
		})
		
		//---------------------operator store----------------
		this.operator_store = Ext.create('Ext.data.Store', {
			fields : ['operator','text','type'],
			data : [
				{'operator': '<','text': _('Less'), 'type':'value' },
				{'operator': '<=','text': _('Less or equal'), 'type':'value' },
				{'operator': '>','text': _('Greater'), 'type':'value' },
				{'operator': '>=','text': _('Greater or equal'), 'type':'value' },
				{'operator': '$all','text': _('Match all'), 'type':'array' },
				{'operator': '$exists','text': _('Exists'), 'type':'boolean' },
				//{'operator': '$mod','text': , 'type': },
				{'operator': '$ne','text':_('Not equal'), 'type':'value' },
				{'operator': '$in','text': _('In'), 'type': 'array'},
				{'operator': '$nin','text': _('Not in'), 'type': 'array'},
				{'operator': '$nor','text': _('Nor'), 'type': 'object'},
				{'operator': '$or','text': _('Or'), 'type': 'object'},
				{'operator': '$and','text': _('And'), 'type': 'object'}
				//{'operator': '$size','text': , 'type': },
				//{'operator': '$type','text': , 'type': }
			]
		})
	}
});

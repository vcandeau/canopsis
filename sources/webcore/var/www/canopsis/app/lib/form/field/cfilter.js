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
	
	height : 1000,
	
	layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
	
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		//define internal object
		this.define_object()
		
		//build operator store
		this.build_store()

		this.items = [this.build_field_panel()]

		this.callParent(arguments);
	},
	
	define_object : function(){
		Ext.define('cfilter.object' ,{
			extend: 'Ext.panel.Panel',
			title : 'Field',
			margin : 5,
			height : 200,
		
			initComponent: function() {
				log.debug('init sub object',this.logAuthor)
				
				//----------------------create combo----------------
				this._combo = Ext.widget('combobox',{
								'name': 'field',
								'queryMode': 'local',
								'displayField': 'text',
								'valueField': 'operator',
								'store': this._store
								})
				
				//----------------------bind events-------------------
				this._combo.on('change',function(combo,value,oldvalue){this._do_action(combo,value,oldvalue)},this)
				
				this.items = [this._combo]
				
				this.callParent(arguments);
			},
			
			_drop_all : function(){
				for(var i = 1; i < this.items; i++)
					this.remove(this.items[i])
			},
			
			_string_value : function(){
				
			},
			
			_do_action : function(combo,value,oldvalue){
				log.debug('combobox changes', this.logAuthor)
				var store = this._store
				var panel = combo.up()
				log.dump(panel)
				//----------------testing type-----------------------
				var search = store.find('operator',value)
				
				if(search == -1){
					//field is a simple value
					log.debug('string value',this.logAuthor)		
				} else {
					
				}
			}
		
		})

	},

	build_field_panel : function(){
		//-----------------Build panel--------------------
		var config = {
			_store: this.field_store
		}
		
		var panel = Ext.create('cfilter.object',config)
		return panel
	},
	
	build_store : function(){
		log.debug('Build stores', this.logAuthor)
		
		//---------------------operator store----------------
		this.field_store = Ext.create('Ext.data.Store', {
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
	},
	

});

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
		
		this.define_object()

		this.build_store()

		this.items = [Ext.create('cfilter.object',{_store: this.field_store})]

		this.callParent(arguments);
	},
	
	define_object : function(){
		//this object is made of two component, upper panel with combobox and
		//string value, and the bottom panel with object (itself) and add button
		
		Ext.define('cfilter.object' ,{
			extend: 'Ext.panel.Panel',
			alias: 'widget.cfilter',
			border: 'false',
			//title : 'Field',
			_store : undefined,
			margin : 5,
		
			initComponent: function() {
				log.debug('init sub object',this.logAuthor)
				this.logAuthor = '[' + this.id + ']'
				//----------------------create combo----------------
				this._combo = Ext.widget('combobox',{
								'name': 'field',
								'queryMode': 'local',
								'displayField': 'text',
								'valueField': 'operator',
								'store': this._store
								})
								
				//--------------------panel-------------------------
				//panel for field and string
				var config = {
					items:[this._combo],
					layout:'hbox',
					border:false
				}
				
				this.upperPanel = Ext.widget('panel',config)
				
				//----------------------bind events-------------------
				this._combo.on('change',function(combo,value,oldvalue){this.on_combo_change(combo,value,oldvalue)},this)
				
				this.items = [this.upperPanel]
				
				this.callParent(arguments);
			},

			//launched when value selected in combobox
			on_combo_change : function(combo,value,oldvalue){
				log.debug(' + Catch changes on combobox', this.logAuthor)

				var index_search = this._store.find('operator',value)
				
				if(index_search == -1){
					log.debug(' + Field is string value',this.logAuthor)
					if(!this.string_value){
						this.remove_cfile_panel()
						this.add_string_value()
					}
				} else {
					log.debug(' + Field is an operator',this.logAuthor)
					var operator_record = this._store.getAt(index_search)
					switch(operator_record.get('type')){
						case 'object':
							this.remove_string_value()
							this.add_cfile_panel()
							break;
						case 'string':
							this.remove_cfile_panel()
							this.add_string_value()
							break;
							
						case 'array':
							break;
							
						default:
							log.debug(' + Unrecognized field type',this.logAuthor)
							break;
					}
				}
			},
			
			//--Operation on string value (the little box next to operator field)--
			remove_string_value : function(){
				if(this.string_value){
					this.upperPanel.remove(this.string_value,true)
					this.string_value = undefined
				}
			},
			
			add_string_value : function(){
				log.debug('  +  Add simple string value',this.logAuthor)
				var config = {
					label: _('value'),
					margin : '0 0 0 10'
				}
				this.string_value = Ext.widget('field',config)
				this.upperPanel.add(this.string_value)
			},
			
			//------Operation on cfile panel (the panel with all the cfiles)------
			remove_cfile_panel : function(){
				if(this.bottomPanel){
					this.bottomPanel.removeAll(true)
					this.bottomPanel.destroy()
					this.bottomPanel = undefined
				}
			},
			
			add_cfile_panel : function(){
				log.debug('  +  Add cfile',this.logAuthor)
				var new_field = this.build_field_panel()
				var add_button = Ext.widget('button',{text:'add'})
				
				var config = {
					border : false,
					margin: '0 0 0 20',
					items:[new_field,add_button]
				}
				
				this.bottomPanel = Ext.widget('panel',config)
				this.add(this.bottomPanel)
				
				//------bind event on add button------
				add_button.on('click',function(){
					var length = this.bottomPanel.items.length
					this.bottomPanel.insert(length -1,this.build_field_panel())
				},this)
				
			},
			
			//return an ready to add cfile
			build_field_panel : function(){
				var config = {	
					_store: this._store,
					border : '0 1 0 0'
				}
				return Ext.create('cfilter.object',config)
			},
			
			
			
		})

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
	
	get_value : function(){
		
	},
	
	set_value : function(){
		
	}

});

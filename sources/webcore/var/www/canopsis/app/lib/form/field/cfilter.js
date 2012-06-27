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
	
	height : 600,
	
	filter : {"$and": [{"source_type":"component"}, {"event_type": {"$ne": "comment"}}, {"event_type": {"$ne": "user"}}]},
	
	layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		this.define_object()
		this.build_store()

		this.cfilter = Ext.create('cfilter.object',{
			operator_store: this.operator_store,
			sub_operator_store:this.sub_operator_store,
			filter:this.filter,
			opt_remove_button : false
		})
		this.items = [this.cfilter]
		
		var finish_button = Ext.widget('button',{handler:this.getValue,text:'finish',scope:this})
		
		this.tbar = [finish_button]
		
		this.callParent(arguments);
	},

	define_object : function(){
		//this object is made of two component, upper panel with combobox 
		//and the bottom panel with object (itself) and add button
		Ext.define('cfilter.object' ,{
			extend: 'Ext.panel.Panel',
			alias: 'widget.cfilter',
			border: false,
			
			operator_store : undefined,
			sub_operator_store : undefined,
			filter:undefined,
			
			opt_remove_button : true,
			
			contain_other_cfile : false,
			
			margin : 5,
		
			initComponent: function() {
				this.logAuthor = '[' + this.id + ']'
				log.debug('init sub object',this.logAuthor)
				//------------------create operator combo----------------
				this.operator_combo = Ext.widget('combobox',{
								'name': 'field',
								'queryMode': 'local',
								'displayField': 'text',
								'valueField': 'operator',
								'store': this.operator_store
								})
				
				//-------------sub operator combo ($in etc...)-----
				this.sub_operator_combo = Ext.widget('combobox',{
								'name': 'field',
								'queryMode': 'local',
								'displayField': 'text',
								'valueField': 'operator',
								'value':'$eq',
								'editable':false,
								'margin' : '0 0 0 5',
								'store': this.sub_operator_store
								})
				
				//--------------------panel-------------------------
				//add button
				var config = {
					text:'add',
					margin: '0 0 0 5',
					hidden:true
				}
				this.add_button = Ext.widget('button',config)
				
				if(this.opt_remove_button){
					//remove button
					var config = {
						text:'remove',
						margin: '0 0 0 5',
					}
					this.remove_button = Ext.widget('button',config)
				}
				
				//string value
				var config = {
					label: _('value'),
					margin : '0 0 0 5'
				}
				this.string_value = Ext.widget('field',config)
				
				//upper panel
				var config = {
					items:[this.operator_combo,this.sub_operator_combo,this.add_button,this.string_value],
					layout:'hbox',
					border:false
				}
				if(this.opt_remove_button)
					config.items.push(this.remove_button)
				this.upperPanel = Ext.widget('panel',config)
				
				//bottom panel
				var config = {
					margin: '0 0 0 20',
					bodyStyle:'border-top:none;border-bottom:none;border-right:none;'
				}
				this.bottomPanel = Ext.widget('panel',config)
				
				//----------------------bind events-------------------
				//combo binding
				this.operator_combo.on('change',function(combo,value,oldvalue){
					this.operator_combo_change(combo,value,oldvalue)
				},this)
				this.add_button.on('click',function(){this.add_cfilter()},this)
				
				if(this.opt_remove_button)
					this.remove_button.on('click',this.remove_button_func,this)
				//-------------------building cfilter-----------------
				this.items = [this.upperPanel,this.bottomPanel]
				this.callParent(arguments);
				
				//--------------load filter if there is filter--------
				if(this.filter)
					this.setValue(this.filter)
			},
			

			//launched when value selected in combobox
			operator_combo_change : function(combo,value,oldvalue){
				log.debug(' + Catch changes on combobox', this.logAuthor)

				//check if operator is known
				var index_search = this.operator_store.find('operator',value)
				
				if(index_search != -1){
					log.debug(' + Field is a known operator',this.logAuthor)
					var operator_record = this.operator_store.getAt(index_search)
					switch(operator_record.get('type')){
						case 'object':
							this.contain_other_cfile = true
							this.string_value.hide()
							this.add_button.show()
							this.sub_operator_combo.hide()
							break;
						case 'value':
							this.contain_other_cfile = false
							this.string_value.show()
							this.sub_operator_combo.show()
							this.add_button.hide()
							break;
						case 'array':
							break;
						default:
							log.debug(' + Unrecognized field type',this.logAuthor)
							break;
					}
				} else {
					//log.debug(' + Unknown operator, showing two options',this.logAuthor)
					this.add_button.hide()
					this.string_value.show()
					this.sub_operator_combo.show()
				}
			},
			
			add_cfilter : function(filter){
				var panel = this.bottomPanel.add(this.build_field_panel(filter))
				this.string_value.hide()
				return panel
			},

			//return an ready to add cfilter
			build_field_panel : function(filter){
				var config = {	
					operator_store: this.operator_store,
					sub_operator_store:this.sub_operator_store,
					filter:filter
					}
				return Ext.create('cfilter.object',config)
			},
			
			remove_button_func: function(){
				this.destroy()
			},
			
			//------------get / set value--------------------
			getValue : function(){
				var items = this.bottomPanel.items.items
				var field = this.operator_combo.getValue()
				
				var value = this.string_value.getValue()
				var output = {}
				
				if(this.contain_other_cfile){
					//get into cfilter
					var values = []
					//get all cfilter values
					for(var i in items){
						var cfilter = items[i]
						values.push(cfilter.getValue())
					}
				}else{
					//just simple value (no inner cfilter)
					var values = {}
					var sub_operator = this.sub_operator_combo.getValue()
					
					if(sub_operator != '' && sub_operator != '$eq')
						values[sub_operator] = this.string_value.getValue()
					else
						var values = this.string_value.getValue()
				}
				
				output[field] = values
				return output
			},
			
			setValue : function(filter){
				log.debug('Set value',this.logAuthor)
				if(typeof(filter) == 'string')
					filter = Ext.decode(filter)
				
				var key = Ext.Object.getKeys(filter)[0]
				var value = filter[key]
				
				this.operator_combo.setValue(key)
				
				var search = this.operator_store.find('operator',key)
				if(search == -1){
					log.debug(' + Field is not an operator',this.logAuthor)
					if(typeof(value) == 'object'){
						var object_key = Ext.Object.getKeys(value)[0]
						var object_value = value[object_key]
						this.sub_operator_combo.setValue(object_key)
						this.string_value.setValue(object_value)
					}else{
						this.string_value.setValue(value)
					}
				}else{
					for(i in value){
						log.debug(' + New cfilter object',this.logAuthor)
						this.add_cfilter(value[i])
					}
				}
			}
		})
	},
	
	build_store : function(){
		log.debug('Build stores', this.logAuthor)
		
		//---------------------operator store----------------
		this.operator_store = Ext.create('Ext.data.Store', {
			fields : ['operator','text','type'],
			data : [
				{'operator': '$nor','text': _('Nor'), 'type': 'object'},
				{'operator': '$or','text': _('Or'), 'type': 'object'},
				{'operator': '$and','text': _('And'), 'type': 'object'},
				{'operator': 'tag','text': _('Tag'), 'type': 'array'}
			]
		})
		
		this.sub_operator_store = Ext.create('Ext.data.Store', {
			fields : ['operator','text','type'],
			data : [
				{'operator': '$eq', 'text':_('Equal'), 'type':'value'},
				{'operator': '$lt','text': _('Less'), 'type':'value' },
				{'operator': '$lte','text': _('Less or equal'), 'type':'value' },
				{'operator': '$gt','text': _('Greater'), 'type':'value' },
				{'operator': '$gte','text': _('Greater or equal'), 'type':'value' },
				{'operator': '$all','text': _('Match all'), 'type':'array' },
				{'operator': '$exists','text': _('Exists'), 'type':'value' },
				{'operator': '$ne','text':_('Not equal'), 'type':'value' },
				{'operator': '$in','text': _('In'), 'type': 'array'},
				{'operator': '$nin','text': _('Not in'), 'type': 'array'}
			]
		})
		
	},
	
	getValue : function(){
		var value = this.cfilter.getValue()
		log.debug('The filter is : ' + Ext.encode(value),this.logAuthor)
		log.dump(value)
		return this.cfilter.getValue()
	},
	
	setValue : function(value){
		this.cfilter.setValue(value)
	}

});

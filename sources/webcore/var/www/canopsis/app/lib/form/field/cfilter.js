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
	namespace: 'event',
	ctype: 'event',
	
	//filter : {"$and": [{"source_type":"component"}, {"event_type": {"$ne": "comment"}}, {"event_type": {"$ne": "user"}}]},
	//filter : '{"$and":[{"fruits":{"$nin":["banana","apple","lemon"]}},{"_id":"5"},{"load":{"$ne":"9"}}]}',
	filter : undefined,
	
	layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
	initComponent: function() {
		this.logAuthor = '[' + this.id + ']'
		log.debug('Initialize ...', this.logAuthor)
		
		this.define_object()
		this.build_store()
		
		//-----------------preview windows----------------
		this.preview_store = Ext.create('canopsis.lib.store.cstore', {
			proxy: {
				 type: 'ajax',
				 url: '/rest/' + this.namespace + '/' + this.ctype,
				 reader: {
					 type: 'json',
					 root: 'data'
				 }
			 },
			autoLoad:false,
			model: 'event'
		})
		this.preview_grid = Ext.widget('grid',{
			store: this.preview_store,
			columns: [
				{ header: 'Name',  dataIndex: 'crecord_name',flex:1 }
			],
		})
		this.preview_window = Ext.widget('window',{
			title:_('Filter preview'),
			constrain: true,
			height : 300,
			width:300,
			items:[this.preview_grid]
		})
		

		//-------------cfilter (wizard part)---------------
		this.cfilter = Ext.create('cfilter.object',{
			operator_store: this.operator_store,
			sub_operator_store:this.sub_operator_store,
			filter:this.filter,
			opt_remove_button : false
		})
		
		//--------------edit area (hand writing part)--------

		this.edit_area = Ext.widget('textarea',{
				hidden:true,
				validator: this.check_json_validity,
				flex : 1
		})

		//---------------------TBAR--------------------------
		var finish_button = Ext.widget('button',{handler:this.getValue,text:'finish',scope:this})
		this.wizard_button = Ext.widget('button',{handler:this.show_wizard,text:'Wizard',scope:this,disabled:true})
		this.edit_button = Ext.widget('button',{handler:this.show_edit_area,text:'edit',scope:this})
		this.preview_button = Ext.widget('button',{handler:this.show_preview,text:'preview',scope:this})

		this.tbar = [finish_button,this.wizard_button,this.edit_button,this.preview_button]
		

		this.items = [this.cfilter,this.edit_area]
		this.callParent(arguments);
	},
	
	check_json_validity : function(value){
		try{
			Ext.decode(value)
			return true
		}catch(err){
			return 'Error: invalid JSON'
		}
	},

	show_wizard : function(){
		if(this.edit_area.validate()){
			var filter = this.edit_area.getValue()
			filter = strip_blanks(filter)
			this.cfilter.remove_all_cfilter()
			this.edit_area.hide()
			this.cfilter.show()
			this.setValue(filter)
			this.wizard_button.setDisabled(true)
			this.edit_button.setDisabled(false)
		}else{
			log.debug('Incorrect JSON given',this.logAuthor)
		}
	},
	
	show_edit_area : function(){
		var filter = this.getValue()
		filter = JSON.stringify(filter, undefined, 8)
		this.edit_area.setValue(filter)
		this.cfilter.hide()
		this.edit_area.show()
		this.wizard_button.setDisabled(false)
		this.edit_button.setDisabled(true)
	},
	
	show_preview : function(){
		var filter = this.getValue()
		if(filter){
			this.preview_store.clearFilter()
			this.preview_store.setFilter(filter)
			this.preview_store.load()
			this.preview_window.show()
		}
	},

	define_object : function(){
		
		//for array input
		Ext.define('cfilter.array_field',{
			extend: 'Ext.panel.Panel',
			
			border:false,
			value: undefined,
			width:200,

			margin: '0 0 0 5',
			layout: 'hbox',
			
			initComponent: function() {
				this.textfield_panel = Ext.widget('panel',{
					border: false,
					items:[Ext.widget('textfield')]
				})

				//--------buttons--------
				this.add_button = Ext.widget('button',{text:'add',margin: '0 0 0 5',})
				//--------build object----
				this.items = [this.textfield_panel,this.add_button]
				this.callParent(arguments);
				//--------bindings-------
				this.add_button.on('click',function(){this.add_textfield()},this)
			},
			
			add_textfield : function(value){
				var config = {}
				if(value)
					config.value = value
				this.textfield_panel.add(Ext.widget('textfield',config))
			},
			
			getValue: function(){
				var output = []
				for(var i in this.textfield_panel.items.items){
					var textfield = this.textfield_panel.items.items[i]
					output.push(textfield.getValue())
				}
				return output
			},
			
			setValue:function(array){
				this.textfield_panel.removeAll()
				for(var i in array){
					this.add_textfield(array[i])
				}
			}
		})
		
		
		//this object is made of two component, upper panel with combobox 
		//and the bottom panel with object (itself) and add button
		Ext.define('cfilter.object' ,{
			extend: 'Ext.panel.Panel',
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
				this.add_button = Ext.widget('button',{text:'add',margin: '0 0 0 5',hidden:true})
				if(this.opt_remove_button)
					this.remove_button = Ext.widget('button',{iconCls: 'icon-cancel',margin: '0 5 0 0'})
				this.string_value = Ext.widget('textfield',{margin : '0 0 0 5'})
				this.array_field = Ext.create('cfilter.array_field',{hidden:true})
			
				var items_array = []
				if(this.opt_remove_button)
					items_array.push(this.remove_button)
				items_array.push(this.operator_combo,this.sub_operator_combo,this.string_value,this.array_field,this.add_button)
				
				//upper panel
				var config = {
					items:items_array,
					layout:'hbox',
					border:false
				}
			
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
				
				this.sub_operator_combo.on('change',function(combo,value,oldvalue){
					this.sub_operator_combo_change(combo,value,oldvalue)
				},this)
				
				//button binding
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
				log.debug(' + Catch changes on operator combobox', this.logAuthor)
				var operator_type = this.get_type_from_operator(value,this.operator_store)
					
				if(operator_type == 'object'){
					log.debug(' + Field is a known operator',this.logAuthor)
					this.contain_other_cfile = true
					this.add_button.show()
					this.string_value.hide()
					this.array_field.hide()
					this.sub_operator_combo.hide()
					this.bottomPanel.show()
				} else {
					log.debug(' + Unknown operator',this.logAuthor)
					this.contain_other_cfile = false
					this.add_button.hide()
					this.sub_operator_combo.show()
					//check sub_operator value
					this.sub_operator_combo_change()
					this.bottomPanel.hide()
				}
			},
			
			sub_operator_combo_change : function(combo,value,oldvalue){
				log.debug(' + Catch changes on sub operator combobox', this.logAuthor)
				if(!value)
					var value = this.sub_operator_combo.getValue()
				
				switch(this.get_type_from_operator(value,this.sub_operator_store)){
					case 'value':
						this.string_value.show()
						this.array_field.hide()
						break;
					case 'array':
						this.string_value.hide()
						this.array_field.show()
						break;
					default:
						log.debug(' + Unrecognized field type',this.logAuthor)
						break;
				}
			},
			
			//give operator and store, return associated type
			get_type_from_operator : function(operator,store){
				var index_search = store.find('operator',operator)
				if(index_search != -1){
					var operator_record = store.getAt(index_search)
					var operator_type = operator_record.get('type')
					return operator_type
				}else{
					return null
				}
			},
			
			add_cfilter : function(filter){
				return this.bottomPanel.add(this.build_field_panel(filter))
			},

			//return an ready to add cfilter
			build_field_panel : function(filter){
				return Ext.create('cfilter.object',{	
							operator_store: this.operator_store,
							sub_operator_store:this.sub_operator_store,
							filter:filter
						})
			},
			
			remove_button_func: function(){
				this.destroy()
			},
			
			remove_all_cfilter : function(){
				this.bottomPanel.removeAll()
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
					var sub_operator_type = this.get_type_from_operator(sub_operator,this.sub_operator_store)
					
					//choose between array or value
					if(sub_operator_type == 'value'){
						if(sub_operator != '$eq')
							values[sub_operator] = this.string_value.getValue()
						else
							var values = this.string_value.getValue()
					}else if(sub_operator_type == 'array'){
						values[sub_operator] = this.array_field.getValue()
					}
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
						
						//check sub operator type
						var sub_operator_type = this.get_type_from_operator(object_key,this.sub_operator_store)
						if(sub_operator_type == 'array')
							this.array_field.setValue(object_value)
						else
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
				{'operator': '$nin','text': _('Not in'), 'type': 'array'},
				{'operator': '$regex','text': _('Regex'), 'type': 'value'},
			]
		})
		
	},
	
	getValue : function(){
		var value = undefined
		if(!this.cfilter.isHidden()){
			var value = this.cfilter.getValue()
		}else{
			if(this.edit_area.validate())
				var value = strip_blanks(this.edit_area.getValue())
		}
		
		if(value){
			if(typeof(value) == 'string')
				value = Ext.decode(value)

			log.debug('The filter is : ' + Ext.encode(value),this.logAuthor)
			return this.cfilter.getValue()
		}else{
			log.debug('Invalid JSON value',this.logAuthor)
			return undefined
		}
	},
	
	setValue : function(value){
		this.cfilter.setValue(value)
	}

});

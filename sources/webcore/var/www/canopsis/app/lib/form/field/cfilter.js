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

Ext.define('canopsis.lib.form.field.cfilter' , {
	extend: 'Ext.panel.Panel',

	alias: 'widget.cfilter',

	border: false,

	namespace: 'events',
	ctype: 'event',
	autoScroll: true,

	//filter : {"$and": [{"source_type":"component"}, {"event_type": {"$ne": "comment"}}, {"event_type": {"$ne": "user"}}]},
	filter: undefined,

	layout: {
        type: 'vbox',
        align: 'stretch'
    },

	isFormField: true,

	getName: function() {
		return this.name;
	},
	isValid: function() {
		return true;
	},
	validate: function() {
		return this.isValid();
	},
	getSubmitData: function() {
		var data = {};
		data[this.name] = this.getValue();
		return data;
	},

	initComponent: function() {
		this.logAuthor = '[' + this.id + ']';
		log.debug('Initialize ...', this.logAuthor);

		this.define_object();
		this.build_store();

		//-----------------preview windows----------------
		this.preview_store = Ext.create('canopsis.lib.store.cstore', {
			model: 'canopsis.model.Event',
			proxy: {
				type: 'rest',
				url: '/rest/' + this.namespace + '/' + this.ctype,
				reader: {
					type: 'json',
					root: 'data',
					totalProperty: 'total',
					successProperty: 'success'
				}
			 },
			autoLoad: false
		});
		
		this.preview_render = function(value, p, record) {
			var node = '';
			if (record.data.resource) {
				node = Ext.String.format('<b>{0}</b><br>&nbsp;&nbsp;{1}', record.data.component, record.data.resource);
			}else {
				node = Ext.String.format('<b>{0}</b>', record.data.component);
			}
			return node;
		}
		
		this.preview_grid = Ext.widget('grid', {
			store: this.preview_store,
			border: false,
			hidden: true,
			hideHeaders:true,
			columns: [
				{
					header: '',
					width: 25,
					sortable: false,
					dataIndex: 'source_type',
					renderer: rdr_source_type
	       		},{
					sortable: false,
					dataIndex: 'id',
					flex: 2,
					renderer: this.preview_render
	       		}]
		});
		/*
		this.preview_window = Ext.widget('window', {
			title: _('Filter preview'),
			layout: 'fit',
			closeAction: 'hide',
			constrain: true,
			constrainTo: this.id,
			height: 300,
			width: 300,
			items: [this.preview_grid]
		});*/

		//-------------cfilter (wizard part)---------------
		this.cfilter = Ext.create('cfilter.object', {
			operator_store: this.operator_store,
			sub_operator_store: this.sub_operator_store,
			//filter:this.filter,
			opt_remove_button: false
		});

		//--------------edit area (hand writing part)--------

		this.edit_area = Ext.widget('textarea', {
				hidden: true,
				validator: this.check_json_validity,
				flex: 1
		});

		//---------------------TBAR--------------------------
		this.wizard_button = Ext.widget('button', {handler: this.show_wizard,
			iconCls: 'icon-wizard',
			tooltip: _('Wizard'),
			scope: this,
			disabled: true,
			margin: 5
		});
		this.edit_button = Ext.widget('button', {
			handler: this.show_edit_area,
			tooltip: _('Edit'),
			iconCls: 'icon-edit',
			margin: 5,
			scope: this
		});
		this.preview_button = Ext.widget('button', {
			handler: this.show_preview,
			tooltip: _('Preview'),
			iconCls: 'icon-preview',
			margin: 5,
			scope: this
		});

		var button_panel = Ext.widget('panel', {
			border: false,
			items: [this.wizard_button, this.edit_button, this.preview_button]
		});

		this.items = [button_panel, this.cfilter, this.edit_area,this.preview_grid];
		this.callParent(arguments);
	},

	check_json_validity: function(value) {
		if (value == '')
			return true;
		try {
			Ext.decode(value);
			return true;
		}catch (err) {
			return 'Error: invalid JSON';
		}
	},
	
	switch_elements_visibility : function(cfilter,edit_area,preview_grid){
		(edit_area)? this.edit_area.show() : this.edit_area.hide();
		(preview_grid)? this.preview_grid.show() : this.preview_grid.hide();
		(cfilter)?  this.cfilter.show() : this.cfilter.hide();
	},
	
	switch_button_state : function(wizard,edit,preview){
		(wizard)? this.wizard_button.setDisabled(false) : this.wizard_button.setDisabled(true);
		(edit)? this.edit_button.setDisabled(false) : this.edit_button.setDisabled(true);
		(preview)?  this.preview_button.setDisabled(false) : this.preview_button.setDisabled(true);
	},
	

	show_wizard: function() {
		if(!this.edit_area.isHidden()){
			if (this.edit_area.validate()) {
				var filter = this.edit_area.getValue();
				filter = strip_blanks(filter);
				this.cfilter.remove_all_cfilter();
				this.setValue(filter);
				
				this.switch_elements_visibility(true,false,false)
				this.switch_button_state(false,true,true)
			}else {
				log.debug('Incorrect JSON given', this.logAuthor);
			}
		}else{
			this.switch_elements_visibility(true,false,false)
			this.switch_button_state(false,true,true)
		}
	},

	show_edit_area: function() {
		var filter = Ext.decode(this.getValue());
		if(filter){
			filter = JSON.stringify(filter, undefined, 8);
			this.edit_area.setValue(filter);
			
			this.switch_elements_visibility(false,true,false)
			this.switch_button_state(true,false,true)
		}
	},

	show_preview: function() {
		var filter = this.getValue();
		if (filter) {
			this.preview_store.clearFilter();
			log.debug('Showing preview with filter: ' + filter, this.logAuthor);
			this.preview_store.setFilter(filter);
			this.preview_store.load();
			
			this.switch_elements_visibility(false,false,true)
			this.switch_button_state(true,true,false)
		}
	},

	define_object: function() {

		//for array input
		Ext.define('cfilter.array_field', {
			extend: 'Ext.panel.Panel',

			border: false,
			value: undefined,

			margin: '0 0 0 5',
			layout: 'hbox',

			initComponent: function() {
				this.textfield_panel = Ext.widget('panel', {
					border: false,
					margin: '0 0 0 5'
				});

				if (!this.value) {
					this.add_textfield();
				}
				//--------buttons--------
				this.add_button = Ext.widget('button', {
					iconCls: 'icon-add',
					//margin: '0 0 0 5',
					tooltip: _('Add new value to this list')
				});
				//--------build object----
				this.items = [this.add_button, this.textfield_panel];
				this.callParent(arguments);
				//--------bindings-------
				this.add_button.on('click', function() {this.add_textfield()},this);
			},

			add_textfield: function(value) {
				var config = {
					//flex:4,
					emptyText: _('Type value here')
				};

				if (value)
					config.value = value;

				var textfield = Ext.widget('textfield', config);
				var remove_button = Ext.widget('button', {
					iconCls: 'icon-cancel',
					margin: '0 0 0 5',
					width: 24,
					tooltip: _('Remove this from list of value')
				});

				var item_array = [textfield];

				//if it's not first elem, add remove button
				if (this.textfield_panel.items.length >= 1)
					item_array.push(remove_button);

				var panel = Ext.widget('panel', {
					border: false,
					margin: '0 0 5 0',
					layout: 'hbox',
					items: item_array
				});
				remove_button.on('click', function(button) {button.up().destroy()});

				return this.textfield_panel.add(panel);
			},

			getValue: function() {
				var output = [];
				for (var i in this.textfield_panel.items.items) {
					var panel = this.textfield_panel.items.items[i];
					var textfield = panel.down('.textfield');
					output.push(textfield.getValue());
				}
				return output;
			},

			setValue: function(array) {
				this.textfield_panel.removeAll();
				for (var i in array) {
					this.add_textfield(array[i]);
				}
			}
		});


		//this object is made of two component, upper panel with combobox
		//and the bottom panel with object (itself) and add button
		Ext.define('cfilter.object' , {
			extend: 'Ext.panel.Panel',
			border: false,

			operator_store: undefined,
			sub_operator_store: undefined,
			filter: undefined,

			opt_remove_button: true,

			contain_other_cfilter: false,

			margin: 5,

			initComponent: function() {
				this.logAuthor = '[' + this.id + ']';
				log.debug('init sub object', this.logAuthor);
				//------------------create operator combo----------------
				this.operator_combo = Ext.widget('combobox', {
								queryMode: 'local',
								displayField: 'text',
								//Hack: don't search in store
								minChars: 50,
								allowBlank : false,
								valueField: 'operator',
								emptyText: _('Type value or choose operator'),
								store: this.operator_store
							});


				//-------------sub operator combo ($in etc...)-----
				this.sub_operator_combo = Ext.widget('combobox', {
								queryMode: 'local',
								displayField: 'text',
								valueField: 'operator',
								value: '$eq',
								editable: false,
								margin: '0 0 0 5',
								store: this.sub_operator_store
							});

				//--------------------panel-------------------------
				this.add_button = Ext.widget('button', {
					iconCls: 'icon-add',
					margin: '0 0 0 5',
					hidden: true,
					tooltip: _('Add new field/condition')
				});

				if (this.opt_remove_button)
					this.remove_button = Ext.widget('button', {
						iconCls: 'icon-cancel',
						margin: '0 5 0 0',
						tooltip: _('Remove this condition')
					});

				this.string_value = Ext.widget('textfield', {
					margin: '0 0 0 5',
					allowBlank : false,
					emptyText: 'Type value here'
					});
				this.array_field = Ext.create('cfilter.array_field', {hidden: true});

				var items_array = [];
				if (this.opt_remove_button)
					items_array.push(this.remove_button);
				items_array.push(this.operator_combo, this.sub_operator_combo, this.string_value, this.array_field, this.add_button);

				//upper panel
				var config = {
					items: items_array,
					layout: 'hbox',
					border: false
				};

				this.upperPanel = Ext.widget('panel', config);

				//bottom panel
				var config = {
					margin: '0 0 0 20',
					bodyStyle: 'border-top:none;border-bottom:none;border-right:none;'
				};
				this.bottomPanel = Ext.widget('panel', config);

				//----------------------bind events-------------------
				//combo binding
				this.operator_combo.on('change', function(combo,value,oldvalue) {
					this.operator_combo_change(combo, value, oldvalue);
				},this);

				this.sub_operator_combo.on('change', function(combo,value,oldvalue) {
					this.sub_operator_combo_change(combo, value, oldvalue);
				},this);

				//button binding
				this.add_button.on('click', function() {this.add_cfilter()},this);

				if (this.opt_remove_button)
					this.remove_button.on('click', this.remove_button_func, this);
				//-------------------building cfilter-----------------
				this.items = [this.upperPanel, this.bottomPanel];
				this.callParent(arguments);

				//--------------load filter if there is filter--------
				if (this.filter)
					this.setValue(this.filter);
			},


			//launched when value selected in combobox
			operator_combo_change: function(combo,value,oldvalue) {
				log.debug(' + Catch changes on operator combobox, value : ' + value, this.logAuthor);
				var operator_type = this.get_type_from_operator(value, this.operator_store);
				//log.debug(' + The type of the operator is: ' + operator_type,this.logAuthor)
				if (operator_type == 'object') {
					//log.debug('   + Field is a known operator',this.logAuthor)
					this.contain_other_cfilter = true;
					this.add_button.show();
					this.string_value.hide();
					this.array_field.hide();
					this.sub_operator_combo.hide();
					this.bottomPanel.show();
				} else {
					//log.debug('   + Unknown operator',this.logAuthor)
					this.contain_other_cfilter = false;
					this.add_button.hide();
					this.sub_operator_combo.show();
					this.sub_operator_combo_change();
					this.bottomPanel.hide();
				}
			},

			sub_operator_combo_change: function(combo,value,oldvalue) {
				//log.debug(' + Catch changes on sub operator combobox, value : ' + value, this.logAuthor)
				if (!value)
					var value = this.sub_operator_combo.getValue();

				switch (this.get_type_from_operator(value, this.sub_operator_store)) {
					case 'value':
						this.string_value.show();
						this.array_field.hide();
						break;
					case 'array':
						this.string_value.hide();
						this.array_field.show();
						break;
					default:
						//log.debug('   + Unrecognized field type',this.logAuthor)
						break;
				}
			},

			//give operator and store, return associated type
			get_type_from_operator: function(operator,store) {
				var index_search = store.find('operator', operator);
				if (index_search != -1) {
					var operator_record = store.getAt(index_search);
					var operator_type = operator_record.get('type');
					return operator_type;
				}else {
					return null;
				}
			},

			add_cfilter: function(filter) {
				return this.bottomPanel.add(this.build_field_panel(filter));
			},

			//return an ready to add cfilter
			build_field_panel: function(filter) {
				//Hack: clean store filters (otherwise combo are empty)
				this.operator_store.clearFilter();
				return Ext.create('cfilter.object', {
							operator_store: this.operator_store,
							sub_operator_store: this.sub_operator_store,
							filter: filter
						});
			},

			remove_button_func: function() {
				this.destroy();
			},

			remove_all_cfilter: function() {
				this.bottomPanel.removeAll();
			},

			//------------get / set value--------------------
			getValue: function() {
				var items = this.bottomPanel.items.items;
				
				var field = undefined
				if(this.operator_combo.validate())
					field = this.operator_combo.getValue();
				if(!field || field == '')
					return undefined

				var value = this.string_value.getValue();
				var output = {};

				if (this.contain_other_cfilter) {
					//get into cfilter
					var values = [];
					//get all cfilter values
					for (var i in items) {
						var cfilter = items[i];
						values.push(cfilter.getValue());
					}
				}else {
					//just simple value (no inner cfilter)
					var values = {};
					var sub_operator = this.sub_operator_combo.getValue();
					var sub_operator_type = this.get_type_from_operator(sub_operator, this.sub_operator_store);

					//choose between array or value
					if (sub_operator_type == 'value') {
						if (sub_operator != '$eq')
							values[sub_operator] = this.string_value.getValue();
						else
							var values = this.string_value.getValue();
					}else if (sub_operator_type == 'array') {
						values[sub_operator] = this.array_field.getValue();
					}
				}

				output[field] = values;
				return output;
			},

			setValue: function(filter) {
				log.debug('Set value', this.logAuthor);
				if (typeof(filter) == 'string')
					filter = Ext.decode(filter);

				var key = Ext.Object.getKeys(filter)[0];
				var value = filter[key];

				//Hack: clear filter before research, otherwise -> search always = -1
				this.operator_store.clearFilter();
				log.debug('Search for the operator "' + key + '" in store', this.logAuthor);
				var search = this.operator_store.find('operator', key);

				this.operator_combo.setValue(key);

				if (search == -1) {
					if (typeof(value) == 'object') {
						log.debug('  + "' + key + '" have a sub operator', this.logAuthor);
						var object_key = Ext.Object.getKeys(value)[0];
						var object_value = value[object_key];
						this.sub_operator_combo.setValue(object_key);

						//check sub operator type
						var sub_operator_type = this.get_type_from_operator(object_key, this.sub_operator_store);
						if (sub_operator_type == 'array') {
							log.debug('   + The sub operator is an array', this.logAuthor);
							this.array_field.setValue(object_value);
						}else {
							log.debug('   + The sub operator is a value', this.logAuthor);
							this.string_value.setValue(object_value);
						}
					}else {
						log.debug('  + "' + key + '" is a simple value', this.logAuthor);
						this.string_value.setValue(value);
					}
				}else {
					log.debug('  + "' + key + '" is a registred operator', this.logAuthor);
					var operator_type = this.get_type_from_operator(key, this.operator_store);
					if (operator_type == 'array') {
						log.debug('  + "' + key + '" contain an array', this.logAuthor);
						var object_key = Ext.Object.getKeys(value)[0];
						this.sub_operator_combo.setValue(object_key);
						var object_value = value[object_key];
						this.array_field.setValue(object_value);
					}else {
						for (i in value) {
							log.debug('  + "' + key + '" contain another cfilter object', this.logAuthor);
							this.add_cfilter(value[i]);
						}
					}
				}
			}
		});
	},

	build_store: function() {
		log.debug('Build stores', this.logAuthor);

		//---------------------operator store----------------
		this.operator_store = Ext.create('Ext.data.Store', {
			fields: ['operator', 'text', 'type'],
			data: [
				{'operator': '$nor', 'text': _('Nor'), 'type': 'object'},
				{'operator': '$or', 'text': _('Or'), 'type': 'object'},
				{'operator': '$and', 'text': _('And'), 'type': 'object'},
				{'operator': 'tags', 'text': _('Tags'), 'type': 'array'}
			]
		});

		this.sub_operator_store = Ext.create('Ext.data.Store', {
			fields: ['operator', 'text', 'type'],
			data: [
				{'operator': '$eq', 'text': _('Equal'), 'type': 'value'},
				{'operator': '$lt', 'text': _('Less'), 'type': 'value' },
				{'operator': '$lte', 'text': _('Less or equal'), 'type': 'value' },
				{'operator': '$gt', 'text': _('Greater'), 'type': 'value' },
				{'operator': '$gte', 'text': _('Greater or equal'), 'type': 'value' },
				{'operator': '$all', 'text': _('Match all'), 'type': 'array' },
				{'operator': '$exists', 'text': _('Exists'), 'type': 'value' },
				{'operator': '$ne', 'text': _('Not equal'), 'type': 'value' },
				{'operator': '$in', 'text': _('In'), 'type': 'array'},
				{'operator': '$nin', 'text': _('Not in'), 'type': 'array'},
				{'operator': '$regex', 'text': _('Regex'), 'type': 'value'}
			]
		});

	},

	getValue: function() {
		var value = undefined;
		
		if (!this.cfilter.isHidden()) {
			value = this.cfilter.getValue();
		}else if (!this.edit_area.isHidden()){
			if (this.edit_area.validate())
				value = strip_blanks(this.edit_area.getValue());
		}else{
			value = this.cfilter.getValue();
		}

		if (value) {
			if (typeof(value) != 'string')
				value = Ext.encode(value);

			log.debug('The filter is : ' + value, this.logAuthor);
			return value;
		}else {
			log.debug('Invalid JSON value', this.logAuthor);
			return undefined;
		}
	},

	setValue: function(value) {
		if (typeof(value) == 'string')
			value = Ext.decode(value);

		log.debug('The filter to set is : ' + Ext.encode(value), this.logAuthor);
		this.cfilter.setValue(value);
	}

});

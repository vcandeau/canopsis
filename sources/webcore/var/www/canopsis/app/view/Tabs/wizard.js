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


/* little fix given on http://www.sencha.com/forum/showthread.php?136583-A-combobox-bug-of-extjs-4.0.2/page2
 * related to combobox bug, this bug is fixed in extjs4.0.6 , do not need this if
 * the extjs version is upgrated*/


//-----------------------------------------//

Ext.define('canopsis.view.Tabs.wizard' ,{
	extend: 'canopsis.lib.view.cwizard',
	
	title : 'Widget Wizard',
	
	data : undefined,
	
	logAuthor : '[widget wizard]',

	initComponent: function() {
		
		//----------------------Build wizard options
		var step1 = {
				title: _('Choose widget'),
				description : _('choose the type of widget you want, its title, and refresh interval'),
				items : [
				{
					xtype : 'textfield',
					fieldLabel : _('Title'),
					name : 'title'
				},{
					xtype: "combo",
					store: 'Widget',
					forceSelection : true,
					fieldLabel : _('Type'),
					name: "xtype",
					displayField: 'name',
					valueField: 'xtype',
					value: 'empty',
				},{
					xtype: 'numberfield',
					fieldLabel: _('Refresh interval'),
					name: 'refreshInterval',
					value: 0,
					minValue: 0
				}]
		}
		/*
		var step2 = {
				title: _('General Options'),
				description: _('Here you choose the component that the widget will display information from'),
				items : [{
						xtype : 'canopsis.lib.form.field.cinventory',
						multiSelect: false,
						name : 'nodeId'
					}
				]
		}
*/
		//this.step_list = [step1,step2]
		this.step_list = [step1]

		this.callParent(arguments);
		
		//////////////////////------ bind actions-------//////////////////////
		//action given by this array are bind by the cwizard class after rendering.
		this.panel_events_list = [
			{itemSource: 'xtype', event: 'select' , _function : this.add_panels},
			//{itemSource: 'xtype', event: 'select' , _function : this.add_nodeId_panel},
			//{itemSource: 'nodeId' , event : 'datachanged', _function : this.loadNodeIdMetric},
		]
		//////////////////-------------------------------------///////////////
		if(this.data){
			//log.debug('editmode')
			this._edit(this.data)
		}
	},

	//function launch when in editing mode
	_edit : function(data){
		this.firstEdit = true
		widgetStore = Ext.data.StoreManager.lookup('Widget')
		//building second step if needed
		if(data.xtype){
			var _index = widgetStore.findBy(
			function(record, id){
				if(record.get('xtype') == data.xtype){
					return true
				}
			}, this)

			var options = widgetStore.getAt(_index).get('options')
			if(options){
				var new_step = {
					title: _('Widget Options'),
					id : 'widgetOptions',
					description : _('Here you can set specific option type of the selected widget'),
					items : options
				}
				this.add_new_step(this.build_step(new_step))
			}
		}
		
		//loading data
		for(var i in data){
			var _variable = this.returnedVariable[i]
			if(_variable){
				log.debug('variable ' + i + ' already track, change value', this.logAuthor)
				if(_variable.xtype == 'combo' || _variable.xtype == 'combobox')
				{
					_variable.clearValue()
				}
				_variable.setValue(data[i])
				
			} else {
				log.debug('not tracked ' + i, this.logAuthor)
			}		
		}
	},
	
	add_panels : function(combo,record){
		//add nodeId panel if widget need it
		this.add_nodeId_panel(combo,record)
		//add metric panel if needed		
		var added = this.add_option_panel(combo,record)
		//if metric panel have been added, make metric listen to choosen nodeId
		this.bind_panel_events([{itemSource: 'nodeId' , event : 'datachanged', _function : this.loadNodeIdMetric}])
	},

	//add the new option tab panel in the wizard
	add_option_panel : function(combo,record){
		log.debug('add widget options panel if needed', this.logAuthor)
		var widgetType = record[0].data
		var widgetOptions = widgetType.options
		
		//if there is option for this widget
		if(widgetOptions){
			var new_step = {
				title: _('Widget Options'),
				id : 'widgetOptions',
				description : _('Here you can set specific option type of the selected widget'),
				items : widgetOptions
			}
			this.remove_step('#widgetOptions')
			this.add_new_step(this.build_step(new_step))
			return true
		} else {
			this.remove_step('#widgetOptions')
			return false
		}
	},
	
	//add the new nodeIdtab panel in the wizard
	add_nodeId_panel : function(combo,record){
		log.debug('add nodeId panel if needed', this.logAuthor)
		var widgetType = record[0].data
		var nodeId = widgetType.nodeId
		if(nodeId){
			//----------------nodeId step------------------
			var new_step = {
				title: _('NodeId selection'),
				id : 'widgetNodeId',
				description: _('Here you choose the widget nodeId'),
				items : [{
						xtype : 'canopsis.lib.form.field.cinventory',
						multiSelect: false,
						name : 'nodeId'
					}
				]
			}
			//---------------------------------------------
			this.remove_step('#widgetNodeId')
			this.add_new_step(this.build_step(new_step))
			return true
		}else{
			this.remove_step('#widgetNodeId')
			return false
		}
	},
	
	loadNodeIdMetric : function(){
		log.debug('load NodeId in metric panel if exist', this.logAuthor)
		var item = this.get_one_item('metrics')
		var nodeId = this.get_one_item('nodeId').getValue()
		if(item){
			//not really clean fix, but when edit, don't load, otherwise metrics will be erase
			if(this.firstEdit){
				this.firstEdit = false
			} else {
				item.setNodeId(nodeId);
			}
		}
	},
	
	finish_button: function(){
		log.debug('save button',this.logAuthor)
		this.fireEvent('save', this.widgetId ,this.get_variables())
		this.close()
	},
	

});

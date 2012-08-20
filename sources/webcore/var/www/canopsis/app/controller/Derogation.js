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
Ext.define('canopsis.controller.Derogation', {
	extend: 'canopsis.lib.controller.cgrid',

	views: ['Derogation.Form','Derogation.Grid'],
	
	model:['Derogation'],
	stores: ['Derogations'],

	logAuthor: '[controller][Derogation]',
	
	init: function() {
		log.debug('[' + this.id + '] - Initialize ...');

		this.formXtype = 'DerogationForm';
		this.listXtype = 'DerogationGrid';

		this.modelId = 'Account';

		this.callParent(arguments);

		global.derogationCtrl = this;
	},
	
	_preSave: function(output){
		//get rid of arrays (when user put x times the same field)
		for(var i in output)
			if(Ext.isArray(output[i]))
				output[i] = output[i][0]
				
		//fix for period ending time
		if(output.for_number && output.for_period){
			output.stopTs = output.startTs + (output.for_number * output.for_period)
			delete output.for_number
			delete output.for_period
		}
		
		//clean info (checkboxfield inner panel cleaning)
		if(!output.downtime){
			delete output.startTs
			delete output.stopTs
		}
		
		log.dump(output)
		return output
	},
	
	//Temporary, will fallback on real function later, wip purpose
	_saveForm: function(form,store) {
		this._preSave(form.getValues())
	},
	
	derogate: function(){
		var form = Ext.create('widget.' + this.formXtype ,{EditMethod:'window'});
		form.win = Ext.create('widget.window', {
			title: 'Derogation',
			items: form,
			closable: false,
			resizable: false,
			constrain: true,
			//renderTo: this.grid.id,
			closeAction: 'destroy'
		}).show();
		this._bindFormEvents(form)
	}
	
	
	
	
})

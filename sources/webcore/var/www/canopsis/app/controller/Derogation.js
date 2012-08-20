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

		this.modelId = 'Derogation';

		this.callParent(arguments);

		global.derogationCtrl = this;
	},
	
	preSave: function(record,data,form){
		output = data
		
		//get rid of arrays (when user put x times the same field)
		for(var i in output)
			if(Ext.isArray(output[i]))
				output[i] = output[i][0]
				
		//fix for period ending time
		if(output.for_number && output.for_period)
			record.set('stopTs',output.startTs + (output.for_number * output.for_period))
			
		record.set('name','one derogation')
		record.set('_id', $.encoding.digests.hexSha1Str(output.output_tpl))
		
		record.set('_id',global.gen_id())
		return record
	},
	
	derogate: function(_id){
		var form = Ext.create('widget.' + this.formXtype ,{EditMethod:'window'});
		form.win = Ext.create('widget.window', {
			title: 'Derogation',
			items: form,
			closable: false,
			resizable: false,
			constrain: true,
			renderTo: Ext.getCmp('main-tabs').getActiveTab().id,
			closeAction: 'destroy'
		}).show();
		this._bindFormEvents(form)
	}
	
	
	
	
})

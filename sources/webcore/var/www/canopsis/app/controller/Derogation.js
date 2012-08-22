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
	
	_saveForm : function(form){
		var store = Ext.getStore('Derogations')
		if (form.form.isValid()) {
			var output = form.getValues();
			
			//cleaning double entries in field set (if someone put many comment/state)
			for(var i in output)
				if(Ext.isArray(output[i]))
					output[i] = output[i][0]
			
			var record = Ext.create('canopsis.model.' + this.modelId);

			//-------------- process record -----------------
			log.debug('Process record', this.logAuthor);
			
			if(output.ts_unit && output.ts_unit){
				var forTs = output.ts_unit * output.ts_window
				record.set('stopTs',output.startTs + forTs)
				record.set('forTs', forTs)
				record.set('ts_unit',output.ts_unit)
				record.set('ts_window',output.ts_window)
			}else{
				record.set('stopTs',output.stopTs)
			}
			
			record.set('startTs',output.startTs)
			record.set('crecord_name',output.crecord_name)
			
			if(form.editing){
				record.set('scope',form.record.scope)
				record.set('scope_name',form.record.scope_name)
			}else{
				record.set('scope',form.scope)
				record.set('scope_name',form.scope_name)
			}
			
			if(output._id != '' && output._id)
				record.set('_id',output._id)
			else
				record.set('_id',global.gen_id())
			
			if(Ext.isNumber(output.state))
				record.set('state',output.state)
			if(output.output_tpl)
				record.set('output_tpl',output.output_tpl)
			if(Ext.isNumber(output.alert_icon))
				record.set('alert_icon',output.alert_icon)
			if(output.alert_msg)
				record.set('alert_msg',output.alert_msg)

			//-------------- save-----------------
			log.dump(record.data)
			store.suspendEvents();
			store.add(record);
			
			//-------------------reload--------------
			log.debug('Reload store', this.logAuthor);
			store.load({
					callback: function(){this.resumeEvents();}
				});
				
			this._cancelForm(form);
		}else{
			log.error('Form is not valid !', this.logAuthor);
			global.notify.notify(_('Invalid form'), _('Please check your form'), 'error');
			return;
		}

	},
	
	afterload_EditForm : function(form, item){
		data = item.data
		
		if(!data.forTs)
			form.periodTypeCombo.setValue('to')
		
		if(data.state != undefined)
			form.addNewField('state',data.state)
		if(data.alert_icon != undefined)
			form.addNewField('alert_icon',data.alert_icon)
		if(data.alert_msg)
			form.addNewField('alert_msg',data.alert_msg)
		if(data.output_tpl)
			form.addNewField('output_tpl',data.output_tpl)
	},
	
	derogate: function(scope,scope_name){
		var form = Ext.create('widget.' + this.formXtype ,{
													EditMethod:'window',
													scope: scope,
													scope_name: scope_name
													});
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

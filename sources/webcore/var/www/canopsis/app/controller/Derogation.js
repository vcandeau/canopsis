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
			var record = Ext.create('canopsis.model.' + this.modelId, data);
			/*
			 * for(var i in output)
			if(Ext.isArray(output[i]))
				output[i] = output[i][0]*/
			
			//-------------- process record -----------------
			log.debug('Process record', this.logAuthor);
			if(output.for_number && output.for_period)
				record.set('stopTs',output.startTs + (output.for_number * output.for_period))
			
			record.set('startTs',output.startTs)
			record.set('crecord_name',output.crecord_name)
			record.set('scope',form._id)
			record.set('scope_name',form.item_name)
			record.set('_id',global.gen_id())
			
			if(Ext.isDefined(output.state))
				record.set('state',output.state)
			if(Ext.isDefined(output.output_tpl))
				record.set('output_tpl',output.output_tpl)
			if(Ext.isDefined(output.alert_icon))
				record.set('alert_icon',output.alert_icon)
			if(Ext.isDefined(output.alert_msg))
				record.set('alert_msg',output.alert_msg)

			//-------------- save-----------------
			store.suspendEvents();
			store.add(record);
			
			//-------------------reload--------------
			log.debug('Reload store', this.logAuthor);
			if(this.grid){
				store.load({
					scope: this,
					callback: function(records, operation, success) {
						this.grid.store.resumeEvents();
					}
				});
			}else{
				store.load()
			}
			this._cancelForm(form);
		}else{
			log.error('Form is not valid !', this.logAuthor);
			global.notify.notify(_('Invalid form'), _('Please check your form'), 'error');
			return;
		}

	},
	
	
	derogate: function(_id,name){
		var form = Ext.create('widget.' + this.formXtype ,{
													EditMethod:'window',
													_id: _id,
													item_name: name
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

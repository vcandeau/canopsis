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
Ext.define('canopsis.controller.Account', {
	extend: 'canopsis.lib.controller.cgrid',
    
	views: ['Account.Grid', 'Account.Form'],
	stores: ['Account'],
	models: ['Account'],

	iconCls: 'icon-crecord_type-account',
	
	logAuthor: '[controller][Account]',

	init: function() {
		log.debug('['+this.id+'] - Initialize ...');

		this.formXtype = 'AccountForm'
		this.listXtype = 'AccountGrid'

		this.modelId = 'Account'

		this.callParent(arguments);
	},
	
	getDashboard: function(){
		if ( ! global.account['dashboard']){
			global.account['dashboard'] = "view._default_.dashboard"
		}
		return global.account['dashboard']
	},

	setDashboard: function(view_id){
		global.account['dashboard'] = view_id
		var uri = '/account/setDashboard/' + view_id
		ajaxAction(uri, {}, function(){
			log.debug(' + setDashboard Ok', this.logAuthor);
		});	
	},
	
	setLocale: function(language){
		var uri = '/account/setLocale/' + language
		ajaxAction(uri, {}, function(){
			log.debug(' + setLocale Ok', this.logAuthor);
			Ext.MessageBox.show({
				title: _('Configure language'),
				msg: _("Application must be reload, do you want reload now ?"),
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OKCANCEL,
  				fn: function(btn){
					if (btn == 'ok'){
						window.location.reload()
					}
				}
			});
		});			
	},

	beforeload_EditForm: function(form){
		var user_textfield = Ext.ComponentQuery.query("#" + form.id + " textfield[name=user]")[0]
		if (user_textfield){
			user_textfield.hide()
		}
	},

	validateForm: function(store, data, form){
		var already_exist = false;

		// in creation mode
		if (! form._record) {
			store.findBy(
				function(record, id){
					if(record.get('user') == data['user']){
						log.debug('User already exist', this.logAuthor + '[validateForm]');
						already_exist = true;  // a record with this data exists
					}
				}
			);
		}

		if (already_exist){
			Ext.MessageBox.show({
				title: data['user'] + ' ' + _('already exist'),
				msg: _("you can't add the same user twice"),
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OK
			});
			return false
		}else{
			return true
		}	
	},
	
});

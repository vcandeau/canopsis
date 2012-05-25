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
	stores: ['Accounts'],
	models: ['Account'],

	iconCls: 'icon-crecord_type-account',
	
	logAuthor: '[controller][Account]',

	init: function() {
		log.debug('['+this.id+'] - Initialize ...');

		this.formXtype = 'AccountForm'
		this.listXtype = 'AccountGrid'

		this.modelId = 'Account'

		this.callParent(arguments);
		
		global.accountCtrl = this
	},

	getConfig: function(id, default_value){
		log.debug(' + getConfig '+id, this.logAuthor);
		if ( ! global.account[id] ){
			if( global[id] ){
				global.account[id] = global[id]
			}else{
				global.account[id] = default_value
			}
		}
		return global.account[id]
	},
	
	setConfig: function(id, value, cb){
		log.debug(' + setConfig ' + id + ' => ' + value, this.logAuthor);
		global.account[id] = value
		
		var url = '/account/setConfig/' + id
		
		if (! cb){
			cb = function(){
				log.debug(' + setConfig Ok', this.logAuthor);
			}
		}
		
		ajaxAction(url, {value: value}, cb, this, 'POST');
		
		return global.account[id]
	},
	
	setLocale: function(locale){
		var cb = function(){
			log.debug(' + setLocale Ok', this.logAuthor);
			Ext.MessageBox.show({
				title: _('Configure language'),
				msg: _("Application must be reloaded, do you want to reload now ?"),
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OKCANCEL,
  				fn: function(btn){
					if (btn == 'ok'){
						window.location.reload()
					}
				}
			});
		}
		
		this.setConfig('locale', locale, cb)	
	},

	beforeload_EditForm: function(form){
		var pass_textfield = Ext.ComponentQuery.query("#" + form.id + " textfield[name=passwd]")[0]
		if (pass_textfield){
			pass_textfield.allowBlank = true
		}

		var user_textfield = Ext.ComponentQuery.query("#" + form.id + " textfield[name=user]")[0]
		if (user_textfield)
			user_textfield.hide()
		
		var passwd_textfield = Ext.ComponentQuery.query("#" + form.id + " textfield[name=passwd]")[0]
		if(passwd_textfield)
			passwd_textfield.allowBlank = true

	},
	
	preSave: function(record,data,form){
		//don't update password if it's empty
		if(form.editing && (record.get('passwd') == '')){
			delete record.data.passwd
		}
		return record
	},

	validateForm: function(store, data, form){
		var already_exist = false;

		// in creation mode
		if (!form.editing) {
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
			global.notify.notify(data['user'] + ' already exist','you can\'t add the same user twice','error')
			return false
		}else{
			return true
		}	
	},
	
	//check if user have right on this record
	check_record_right : function(record,option){
		var user = global.account.user
		var groups = global.account.groups

		//root can do everything
		if(user == 'root'){
			return true
		}
		
		if((option == 'r') || (option == 'w')){
			if ((user == record.get('aaa_owner')) && (record.data.aaa_access_owner.indexOf(option) > -1)){
				//log.debug('owner')
				return true
			} else if((groups.indexOf(record.get('aaa_group')) != -1) && (record.data.aaa_access_group.indexOf(option) > -1)){
				//log.debug('group')
				return true
			} else {
				//log.debug('nothing')
				return false
			}
		} else {
			log.error(_('Incorrect right option given'),this.logAuthor)
		}
	},
	
	//check if user have right on this obj
	check_right: function(obj,option){
		var user = global.account.user
		var groups = global.account.groups

		//root can do everything
		if(user == 'root'){
			return true
		}
		
		if((option == 'r') || (option == 'w')){
			if ((user == obj.aaa_owner) && (obj.aaa_access_owner.indexOf(option) > -1)){
				//log.debug('owner')
				return true
			} else if((groups.indexOf(obj.aaa_group) != -1) && (obj.aaa_access_group.indexOf(option) > -1)){
				//log.debug('group')
				return true
			} else {
				//log.debug('nothing')
				return false
			}
		} else {
			log.error(_('Incorrect right option given'),this.logAuthor)
		}
		
	},
	
	//if callback_func != null and ajax success -> callback is call in passed scope with
	//new key as argument
	new_authkey : function(account,callback_func,scope){
		if(account){
			//------------------------------ajax request----------------------
			log.debug('Ask webserver for new authentification key',this.logAuthor)
			Ext.Ajax.request({
				url: '/account/getNewAuthKey/' + account,
				method: 'GET',
				scope: scope,
				success: function(response){
					var object_response = Ext.decode(response.responseText)
					if(object_response.success == true){
						global.notify.notify(_('Success'),_('Your authentification key is updated'))
						var authkey = object_response.data.authkey
						global.account.authkey = authkey
						if(callback_func)
							callback_func.call(this,authkey)
					}else{
						log.error('Ajax output incorrect',this.logAuthor)
					}
				},
				failure : function(response){
					global.notify.notify(_('Error'),_('An error have occured during the updating process'),'error')
					log.error('Error while fetching new Authkey',this.logAuthor)
				}
			})
		}else{
			log.error('No account provided for Authkey')
		}
	},

	get_authkey : function(account,callback_func,scope){
		log.debug('Ask webserver for authentification key',this.logAuthor)
		Ext.Ajax.request({
			url: '/account/getAuthKey/' + account,
			method: 'GET',
			scope: scope,
			success: function(response){
				var object_response = Ext.decode(response.responseText)
				if(object_response.success == true){
					var authkey = object_response.data.authkey
					if(callback_func)
						callback_func.call(this,authkey)
				}else{
					log.error('Ajax output incorrect',this.logAuthor)
				}
			},
			failure : function(response){
				global.notify.notify(_('Error'),_('An error have occured during the process'),'error')
				log.error('Error while fetching new Authkey',this.logAuthor)
			}
		})
	}	
});

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
Ext.define('canopsis.lib.view.cauthkey' ,{
	extend: 'Ext.window.Window',
	
	alias: 'widget.crights',
	
	title: _('My Authentification key'),
	
	constrain: true,
	
	//layout : 'hbox',
	
	logAuthor: '[cauthkey]',
	
	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		//-----------------------Build inner form----------------
		var config = {
			readOnly : true,
			width : 450,
			value : global.account.authkey
		}
		this.authkey_field = Ext.widget('textfield',config)
		
		var buttonConfig = {
			tooltip : _('Ask for a new key'),
			text: 'R',
			width : 32
		}
		this.refreshButton = Ext.widget('button',buttonConfig)
		
		//-------------------------Build form--------------------
		var formConfig = {
			border:false,
			layout:'hbox',
			width : config.width + buttonConfig.width,
			height : 22,
		}
		this._form = Ext.create('Ext.form.Panel',formConfig)
		this._form.add([this.authkey_field,this.refreshButton])
		this.items = [this._form]
		//this.items = [this.authkey_field,this.refreshButton]
		
		this.callParent(arguments)
		
		this._bindEvents()
	},


	_bindEvents : function(){
		log.debug('Binding Events',this.logAuthor)
		
	}

});


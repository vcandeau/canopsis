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



Ext.define('canopsis.lib.view.cfile_window' , {
	extend: 'canopsis.lib.view.cpopup',
	alias: 'widget.cfile_window',
	
	logAuthor: '[cfile_window]',
	
	title: _('Select a file'),
	
	width: 400,
	
	_name : _('file'),
	_fieldLabel : _('file'),
	_buttonText : _('Select file'),
	
	_buildForm : function(){
		
		this._fileField = this._form.add(Ext.create('Ext.form.field.File',{
			xtype: 'filefield',
			name: this._name,
			fieldLabel: this._fieldLabel,
			labelWidth: 50,
			msgTarget: 'side',
			allowBlank: false,
			anchor: '100%',
			buttonText: this._buttonText
		}));
			
		return this._form
	},
	
	ok_button_function : function(){
		log.debug('clicked on ok button',this.logAuthor)
		this.fireEvent('save',this._fileField.fileInputEl.dom.files)
	}
})

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
Ext.define('canopsis.lib.view.cmail' ,{
	extend: 'Ext.window.Window',
	
	alias: 'widget.crights',
	
	title: 'Email edition',
	
	//isFormField : 'true'

	logAuthor: '[cmail]',	
	
	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		var to = Ext.widget('textfield',{
				fieldLabel: _('TO'),
				name: 'to',
		})
		
		var comboUser = Ext.widget('combo',{
				//forceSelection: true,
				//fieldLabel: _(""),
				queryMode: 'local',
				displayField: 'user',
				valueField: 'user',
				store : 'Account'
			})

		var addUserButton = Ext.widget('button',{
			xtype : 'button',
			text : _('Add')
		})
		
		//---------------------------
		var subject = Ext.widget('textfield',{
				fieldLabel: _('subject'),
				name: 'subject',
		})
		//--------------------------
		var body = Ext.widget('htmleditor',{
				fieldLabel: _('body'),
				name: 'body',
		})
		//--------------------------
		this.items = [to,comboUser,addUserButton,subject,body]
		this.callParent(arguments)
		this.show()
	},
	
	_getValues : function(){
		
	}
	
});

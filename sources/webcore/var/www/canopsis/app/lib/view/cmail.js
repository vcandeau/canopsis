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
	
	bbar : [{
				xtype:'button',
				text : _('Cancel'),
				action : 'cancel'
			},'->',{
				xtype:'button',
				text: _('Finish'),
				action : 'finish'
			}],
	
	initComponent: function() {
		log.debug('Initializing...', this.logAuthor)
		
		this.to = Ext.widget('textfield',{
				fieldLabel: _('To'),
				name: 'to',
		})
		
		this.comboUser = Ext.widget('combo',{
				//forceSelection: true,
				//fieldLabel: _(""),
				queryMode: 'local',
				displayField: 'user',
				valueField: 'user',
				store : 'Account'
			})

		this.addUserButton = Ext.widget('button',{
			xtype : 'button',
			text : _('Add')
		})
		
		//---------------------------
		this.subject = Ext.widget('textfield',{
				fieldLabel: _('subject'),
				name: 'subject',
		})
		
		//--------------------------
		this.mailbody = Ext.widget('htmleditor',{
				fieldLabel: _('body'),
				name: 'body',
		})
		
		//-------------------------- Building-----------------------------
		this.items = [this.to,this.comboUser,this.addUserButton,this.subject,this.mailbody]
		this.callParent(arguments)
		log.debug('Show window', this.logAuthor)
		this.show()
		
		
		//-------------------------- binding events----------------------
		this.addUserButton.on('click',this._addUser, this)
		
		log.dump(this.id)
		
		var btnCancel = Ext.ComponentQuery.query('#' + this.id + ' button[action=cancel]')
		log.dump(btnCancel)
		btnCancel.on('click',function(){this.close},this)
		
		var btnFinish = Ext.ComponentQuery.query('#' + this.id + ' button[action=finish]')
		log.dump(btnFinish)
		btnFinish.on('click',function(){log.debug('',this.logAuthor)},this)
	},
	
	_addUser : function(){
		log.debug('clicked on adduser',this.logAuthor)
		var recipientsValue = this.to.getValue()
		if(recipientsValue == ''){
			this.to.setValue(this.comboUser.getValue())
		} else {
			this.to.setValue(recipientsValue + ',' + this.comboUser.getValue())
		}
	},
	
	_getValues : function(){
		
	}
	
});

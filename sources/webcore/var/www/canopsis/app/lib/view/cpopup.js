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

Ext.define('canopsis.lib.view.cpopup' , {
	extend: 'Ext.window.Window',
	alias: 'widget.cpopup',
	
	_component : undefined,
	
	cls: Ext.baseCSSPrefix + 'message-box',
	
	width:300,
	
	initComponent: function() {
		log.debug('Initialize cpopup', this.logAuthor);

		this.amqp_event = {
		  'connector':         'Canopsis',
		  'connector_name':    'widget-weather',
		  'event_type':        'log',
		  'source_type':       'resource',
		  'component':         this._component,
		  'resource':          'user_problem',
		  'state':             2,
		  'state_type':        1,
		  'output':            '',
		}
		
		this._form = Ext.create('Ext.container.Container',{
			flex: 1,
			layout: {
				type: 'anchor'
			},
			border:false,
			items:[{
				xtype:'displayfield',
				value: _('Type your message here:'),
				//anchor:'100%'*
			},{
				xtype:'textarea',
				anchor:'100% 100%',
			}]
		})
		
		var button_ok = Ext.create('Ext.button.Button',{
			xtype:'button',
            handler: function(){console.log('frsgr')},
            scope: this,
            text: 'OK',
            minWidth: 75
        });
        
       var tbar = new Ext.toolbar.Toolbar({
            ui: 'footer',
            dock: 'bottom',
            layout: {
                pack: 'end'
            },
            items: [button_ok]
        });
        
        this.dockedItems = [tbar]
        this.items = [this._form]
        
        this.callParent(arguments);
		
		this.show()
	},

});

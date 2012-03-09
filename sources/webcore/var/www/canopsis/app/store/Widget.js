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
Ext.define('canopsis.store.Widget', {
    extend: 'canopsis.lib.store.cstore',
	model: 'canopsis.model.widget',
	
	storeId: 'store.Widget',
	
	logAuthor : '[store][widget]',
	
	item_to_translate : ['title','fieldLabel','boxLabel'],

	autoLoad: true,
	sortOnLoad: true,
	
	constructor: function(config)
    {    
        this.callParent(arguments);
        this.on('load',this.check_translate,this)
    },
	
	sorters: [
        {
            property : 'name',
            direction: 'DESC'
        }
    ],
	
	proxy: {
		type: 'rest',
		url: '/ui/widgets',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
	},
	
	check_translate : function(){
		if(global.locale != 'en'){
			log.debug('Attempting to translate widget in store', this.logAuthor)
			this.each(function(record){
				var options = record.get('options')
				if(options != undefined){
					for(i in options){
						this.translate(record.get('xtype'),options[i])
					}
				}
			},this)
		}
	},
	//recursive translate function for widget records
	translate : function(xtype,record_data){
		//log.debug('translate : ' + record_data.title,this.logAuthor)
		// for every item
		for(item_name in record_data){
			var item = record_data[item_name]
			//if the item must be translated
			if(this.item_to_translate.indexOf(item_name) > -1){
				//log.debug('translating : ' + item)
				record_data[item_name] = _(item,xtype)
			} else if(item_name == 'items'){
				//if there is item in items
				for(sub_item in item){
					this.translate(xtype,item[sub_item])
				}
			}
			
			
		}
	}
	
});

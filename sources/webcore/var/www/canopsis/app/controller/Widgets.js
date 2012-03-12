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
Ext.define('canopsis.controller.Widgets', {
    extend: 'Ext.app.Controller',

    //views: ['Widgets.kpi', 'Widgets.host_header'],
    stores: ['Widget'],
    models: ['event'],
    
    item_to_translate : ['title','fieldLabel','boxLabel'],

    logAuthor: "[controller][Widgets]",

    init: function() {
		Ext.Loader.setPath('widgets', './widgets');
		this.store = this.getStore('Widget');
		log.debug('parsing Widget store', this.logAuthor);
		this.store.on('load',function(){
			this.store.each(function(record){
				log.debug('loading ' + record.data.xtype, this.logAuthor);
				var name ='widgets.' + record.data.xtype + '.' + record.data.xtype ;
				Ext.require(name);
				if (record.data.locales){
					if (record.data.locales.indexOf(global.locale) >= 0){
						log.debug(' + loading locale '+global.locale+' ...', this.logAuthor);
						var name ='widgets.' + record.data.xtype + '.locales.lang-' +  global.locale;
						Ext.require(name);
					}
				}
			}, this);
			
			//translate the store
			this.check_translate();
			
			// small hack
			Ext.Function.defer(function(){ 
				this.fireEvent('loaded');
			 },1000, this);

			/*
			setTimeout(function(ctrl){ 
				ctrl.fireEvent('loaded');
			 },1000, this);
			*/
		}, this);
    },
    
	check_translate : function(){
		if(global.locale != 'en'){
			log.debug('Attempting to translate widget in store', this.logAuthor)
			this.store.each(function(record){
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

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
    models: ['inventory'],

    init: function() {
		Ext.Loader.setPath('widgets', './widgets');
		this.store = this.getStore('Widget');
		log.debug('[controller][Widgets] : parsing Widget store');
		this.store.on('load',function(){
			this.store.each(function(record){
				log.debug('[controller][Widgets] : loading ' + record.data.xtype);
				var name ='widgets.' + record.data.xtype + '.' + record.data.xtype ;
				Ext.require(name);
			});
			
			// small hack
			setTimeout(function(ctrl){ ctrl.fireEvent('loaded'); },1000, this);

		}, this);
    },
    
	
});

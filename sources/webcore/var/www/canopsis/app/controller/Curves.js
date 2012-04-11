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
Ext.define('canopsis.controller.Curves', {
    extend: 'canopsis.lib.controller.cgrid',

    views: ['Curves.Grid', 'Curves.Form'],
    stores: ['Curve'],
    models: ['curve'],

    logAuthor: "[controller][Curves]",

	init: function() {
		log.debug('Initialize ...', this.logAuthor);

		this.formXtype = 'CurvesForm'
		this.listXtype = 'CurvesGrid'

		this.modelId = 'curve'

		this.callParent(arguments);
		
		global.curvesCtrl = this
    },
    
	preSave: function(record,data,form){
		record.data['_id'] = $.encoding.digests.hexSha1Str(record.data['metric']);
		record.data['crecord_name'] = record.data['metric'];
		return record
	},

	getRenderInfo: function(metric) {
		if (metric){
			var _id = $.encoding.digests.hexSha1Str(metric);
			var store = Ext.data.StoreManager.lookup('Curve')
			var info = store.getById(_id)
			if (info){
				return info
			}
		}
	},
	
	getRenderColor: function(metric, index) {
		if (! index)
			index = 0
			
		var color = global.default_colors[index]
		
		var info = this.getRenderInfo(metric)
		if (info){
			color = '#' + info.get('color')
		}
		
		return color
	}
  
});

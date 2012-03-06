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
function init_REST_Store(collection, selector, groupField){
	var options = {}
	log.debug("Init REST Store, Collection: '"+collection+"', selector: '"+selector+"', groupField: '"+groupField+"'")
	
	options['storeId'] = collection+selector
	options['id'] = collection+selector
	//options['model'] = Ext.create('canopsis.model.'+collection)
	//options['model'] = 'canopsis.model.'+collection
	options['model'] = Ext.ModelMgr.getModel('canopsis.model.'+collection)
	if (groupField){
		options['groupField'] = groupField
	}
	
	var store = Ext.create('canopsis.store.Mongo-REST', options)
	store.proxy.url = '/webservices/rest/'+collection+'/'+selector

	return store
}

//Ajax action
var ajaxAction = function(uri, params, cb, scope){
	Ext.Ajax.request({
		url: uri,
		scope: scope,
		success: cb,
		failure: function (result, request) {
			log.error("Ajax request failed ... ("+request.url+")", this.logAuthor)
		} 
	});
}

// Create Global "extend" method
var extend = function(obj, extObj) {
    if (arguments.length > 2) {
        for (var a = 1; a < arguments.length; a++) {
            extend(obj, arguments[a]);
        }
    } else {
        for (var i in extObj) {
            obj[i] = extObj[i];
        }
    }
    return obj;
};

var random_id = function () { return Math.floor(Math.random()*11)}

//find the greatest common divisor
function find_gcd(nums)
{
        if(!nums.length)
                return 0;
        for(var r, a, i = nums.length - 1, GCDNum = nums[i]; i;)
                for(a = nums[--i]; r = a % GCDNum; a = GCDNum, GCDNum = r);
        return GCDNum;
}

// Split AMQP Routing key
function split_amqp_rk(rk){
	var rk = rk.split('.')
	// check
	if (rk[2] == 'check'){
		return {source_type: rk[3]  ,component: rk[4], resource: rk[5]}
	}
	return {}
}

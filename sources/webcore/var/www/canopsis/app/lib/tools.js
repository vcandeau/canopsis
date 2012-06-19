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
function init_REST_Store(collection, selector, groupField) {
	var options = {};
	log.debug("Init REST Store, Collection: '" + collection + "', selector: '" + selector + "', groupField: '" + groupField + "'");

	options['storeId'] = collection + selector;
	options['id'] = collection + selector;
	//options['model'] = Ext.create('canopsis.model.'+collection)
	//options['model'] = 'canopsis.model.'+collection
	options['model'] = Ext.ModelMgr.getModel('canopsis.model.' + collection);
	if (groupField) {
		options['groupField'] = groupField;
	}

	var store = Ext.create('canopsis.store.Mongo-REST', options);
	store.proxy.url = '/webservices/rest/' + collection + '/' + selector;

	return store;
}

//Ajax action
var ajaxAction = function(url, params, cb, scope, method) {
	if (!method)
		method = 'GET';

	var options = {
		method: method,
		url: url,
		scope: scope,
		success: cb,
		params: params,
		failure: function(result, request) {
			log.error('Ajax request failed ... ('+ request.url + ')', this.logAuthor);
		}
	};
	Ext.Ajax.request(options);
};

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

var random_id = function() { return Math.floor(Math.random() * 11)};

//find the greatest common divisor
function find_gcd(nums)
{
        if (!nums.length)
                return 0;
        for (var r, a, i = nums.length - 1, GCDNum = nums[i]; i;)
                for (a = nums[--i]; r = a % GCDNum; a = GCDNum, GCDNum = r);
        return GCDNum;
}

// Split AMQP Routing key
function split_amqp_rk(rk) {
    var srk = rk.split('.');

    if (srk[2] == 'check') {
        var component;
        var resource;
        if (srk[3] == 'resource') {
            var expr = /^(\w*)\.(\w*)\.(\w*)\.(\w*)\.(.*)\.([\w\-]*)$/g;
            var result = expr.exec(rk);
            if (result) {
                component = result[5];
                resource = result[6];
            }
        }else {
            var expr = /^(\w*)\.(\w*)\.(\w*)\.(\w*)\.(.*)$/g;
            var result = expr.exec(rk);
            if (result)
                component = result[5];
        }

        return {source_type: srk[3] , component: component, resource: resource};
    }
    return {};
}

function get_timestamp_utc(date) {
	if (! date)
		date = new Date();

	var localTime = parseInt(date.getTime() / 1000);
	var localOffset = parseInt(date.getTimezoneOffset() * 60);

	return localTime - localOffset;
}

function isEmpty(obj) {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop))
			return false;
	}
	return true;
}

function getPct(value, max, decimal) {
	if (! decimal)
		decimal = 2;

	if (max == 0)
		return 100;

	var div = Math.pow(10, decimal);

	return Math.round(((100 * value) / max) * div) / div;
}

function getMidnight(timestamp) {
	var time = new Date(timestamp);
	var new_time = timestamp - (time.getHours() * global.commonTs.hours * 1000);
	//floor to hour, time / hour * hour
	new_time = parseInt(new_time / (global.commonTs.hours * 1000)) * (global.commonTs.hours * 1000);
	return new_time;
}


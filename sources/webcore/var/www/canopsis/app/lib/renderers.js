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
var rdr_tstodate = function (val) {
	var dval = new Date(parseInt(val)*1000);
	
	var dval_day = Ext.Date.format(dval,'Y-m-d')
	var now_day = Ext.Date.format(new Date(),'Y-m-d')

	if (dval_day == now_day){
		return Ext.Date.format(dval,'H:i:s')
	}else{
		return Ext.Date.format(dval,'Y-m-d H:i:s')
	}
}

var rdr_status = function (val, metadata, record, rowIndex, colIndex, store) {
	return "<span class='icon icon-state-"+val+"' />"
}

var rdr_state_type = function (val, metadata, record, rowIndex, colIndex, store) {
	return "<span class='icon icon-state-type-"+val+"' />"
}

var rdr_source_type = function (val, metadata, record, rowIndex, colIndex, store) {
	return "<span class='icon icon-crecord_type-"+val+"' />"
}

/*var HOST_NAME=""
var rdr_host_name = function(val){
        if (val == HOST_NAME){
                return ""
        }else{
                HOST_NAME = val
                return val
        }
    }
*/

var rdr_crecord_type = function (val, metadata, record, rowIndex, colIndex, store) {
	if (val != ''){
		return "<span class='icon icon-crecord_type-"+val+"' />"
	}
}

var rdr_havePerfdata = function (val, metadata, record, rowIndex, colIndex, store) {
	if (val != ''){
		return "<span class='icon icon-perfdata'/>";
	}
}

var rdr_widget_preview = function (val, metadata, record, rowIndex, colIndex, store) {	
	return "<span style='background-color:" + global.default_colors[rowIndex] + ";color:" + global.default_colors[rowIndex] + ";'>__</span>"
}

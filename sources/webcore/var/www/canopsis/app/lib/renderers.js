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

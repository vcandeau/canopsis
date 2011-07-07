var rdr_tstodate = function (val) {
	var d = new Date(parseInt(val)*1000);
	return Ext.Date.format(d,'H:i:s')
}

var rdr_status = function (val, metadata, record, rowIndex, colIndex, store) {
	if (val > 0){ val=2; }
	return "<img width='16' height='16' src='themes/canopsis/resources/images/states/"+val+".png'/>"
}

var reload_grid = function(grid) {
	var store = Ext.getCmp(grid).store
	store.load(store.lastOptions)
}

var HOST_NAME=""
var rdr_host_name = function(val){
        if (val == HOST_NAME){
                return ""
        }else{
                HOST_NAME = val
                return val
        }
    }

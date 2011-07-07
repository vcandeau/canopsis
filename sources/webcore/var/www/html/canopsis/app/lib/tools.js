function init_REST_Store(collection, selector, groupField){
	var options = {}
	console.log("Init REST Store, Collection: '"+collection+"', selector: '"+selector+"', groupField: '"+groupField+"'")
	
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

function add_view_tab(id, title){
	console.log("Add view tab '"+id+"'")
	var maintabs = Ext.getCmp('main-tabs');
	var tab = Ext.getCmp(id+'-tab');
	
	//console.log(record.data)
	if (tab) {
		console.log(" - Tab allerady open, just show it")
		maintabs.setActiveTab(tab);
	}else{
		console.log(" - Create tab ...")
		maintabs.add({
			title: title,
			id: id+"-tab",
			view: id,
			xtype: 'TabsContent',
			closable: true
		}).show();
	}
}

var random_id = function () { return Math.floor(Math.random()*11)}


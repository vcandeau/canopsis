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

function add_view_tab(id, title, closable){
	log.debug("Add view tab '"+id+"'")
	
	if (closable == undefined) { closable=true } else { closable=false }

	var maintabs = Ext.getCmp('main-tabs');
	var tab = Ext.getCmp(id+'.tab');
	
	//log.debug(record.data)
	if (tab) {
		log.debug(" - Tab allerady open, just show it")
		maintabs.setActiveTab(tab);
	}else{
		log.debug(" - Create tab ...")
		log.debug("    - Get view config ("+id+") ...")
	
		var store = Ext.data.StoreManager.lookup('store.View')
		var view = store.getById(id)
		
		maintabs.add({
			title: title,
			id: id+".tab",
			view_id: id,
			view: view,
			xtype: 'TabsContent',
			closable: closable
		}).show();
	}
}

function remove_active_tab(){
	Ext.getCmp('main-tabs').remove(Ext.getCmp('main-tabs').getActiveTab())
}

var random_id = function () { return Math.floor(Math.random()*11)}

function show_dashboard(){
	log.dump("Get my dashboard ...")
	Ext.Ajax.request({
		url: '/ui/dashboard',
		success: function(response){
			data = Ext.JSON.decode(response.responseText)
			data = data.data[0]
			this.data = data
			add_view_tab(data._id, 'Dashboard', false)
		},
		failure: function (result, request) {
				log.error("Ajax request failed ... ("+request.url+")")
		} 
	});
}


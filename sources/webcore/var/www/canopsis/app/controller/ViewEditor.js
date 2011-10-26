Ext.define('canopsis.controller.ViewEditor', {
    extend: 'Ext.app.Controller',
    
    views: ['ViewEditor.View'],
    stores: ['ViewEditor'],
    models: ['view'],

	refs : [
	{
		ref : 'tree',
		selector: 'ViewEditor'
	},
	{
		ref : 'treeOrder',
		selector: 'TreeOrdering'
	}],

    init: function() {
        console.log('Initialized ViewEditor');
        
        this.control({
			'ViewEditor #addButton' : {
				click: this.addButton
			},
			'ViewEditor #deleteButton' : {
				click: this.deleteButton
			},
			'ViewEditor' : {
				itemdblclick: this.configureItem
			},
		
			'ViewEditor': {
				selectionchange: this.selectionchange
			},
			
			//listener on the editor, because we must get option from editor
			'ConfigView button[action=save]': {
				click : this.saveView
			},
			
		});
	},
	
	configureItem :function(view, item, index) {
		console.log('configure the item')
		console.log(item);
		console.log(view);
		console.log(index);
	},
	
	
	addButton: function() {
		console.log('viewEdit : adding a new view');
		var main_tabs = Ext.getCmp('main-tabs');
		if(!Ext.getCmp('ConfigView'))
		{
			main_tabs.add({
				title: 'New View',
				xtype: 'ConfigView',
				id: 'ConfigView',
				closable: true,}).show();
		} else {
			console.log('tab already created');
		}
	},
	
	deleteButton: function() {
		var store = this.getTree().getStore();
		console.log('viewEdit : delete a view');
		var selectedNode = this.getTree().getSelectionModel().getSelection()[0];

		if (selectedNode)
		{
			//this is UNSTABLE and can ERASE the entire tree (and your database)
			/*
			console.log(selectedNode)
			console.log(store)
			var rootnode = store.getRootNode();
			if(rootnode.removeChild(selectedNode))
			{
				console.log('removed');
			}else{
				console.log('don\'t removed');
			}
			store.sync();
			*/
			
			//this solve temporary the problem
			Ext.Ajax.request({
				url: '/ui/views/' + selectedNode.internalId,
				method: 'DELETE',
			});
			store.load();
			Ext.data.StoreManager.lookup('Menu').load();
		}	
	},
	
	selectionchange: function(selections){
		this.getTree().down('#deleteButton').setDisabled(selections.length === 0);
	}, 
	
	saveView : function(button){
		var view = this.getTree()
		var store = view.store;
		var store_source = this.getTreeOrder().store;
		
		console.log('clicked on save view');
		var name = Ext.getCmp('ConfigView').down('textfield');
		//console.log(name);
		
		//TODO : Better way to fix that
		var record = Ext.create('canopsis.model.view');
		record.set('name', name.value);
		record.set('hunit', '200');
		record.set('column', '5');
		record.set('leaf',true);
		
		//get all node and stock them in an object
		var temptab = [];
		
		store_source.getRootNode().eachChild(function(node) {
			temptab.push(node.data);
		});	
		
		record.set('lines', temptab);
		//console.log('the record');
		//console.log(record);
		if(this.validateView(store,record))
		{
			Ext.MessageBox.show({
				title: record.get('name') + 'view already exist !',
				msg: 'you can\'t add the same view twice',
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OK
			});
		} else {
			//this is UNSTABLE and can ERASE all the tree (and your database)
			
			//store.getRootNode().appendChild(record);
			//store.sync();
			//store.load();
			
			//this solv the problem
			Ext.Ajax.request({
				url: '/ui/views',
				params: Ext.JSON.encode(record.data),
				method: 'POST',
			});
			store.load();
			//reloading menu tree
			Ext.data.StoreManager.lookup('Menu').load();
			//destroy Config view and get back on viewEditor
			remove_active_tab();
			this.getTree().show();
		}
	},
	
	validateView : function(store, record){
		var already_exist = false;
		if(store.getRootNode().findChild('name', record.get('name')) != null){
			already_exist = true;
		}
		return already_exist;
	}
	
});

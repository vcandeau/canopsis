Ext.define('canopsis.controller.ViewEditor', {
    extend: 'Ext.app.Controller',
    
    views: ['ViewEditor.View'],
    stores: ['ViewEditor'],
    models: ['view'],

	refs : [
	{
		ref : 'viewGrid',
		selector: 'ViewEditor'
	},
	{
		ref : 'GridOrder',
		selector: 'GridOrdering'
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
		
			'ViewEditor': {
				selectionchange: this.selectionchange,
				itemdblclick: this.configureItem
			},
			
			//listener on the editor, because we must get option from editor
			'ConfigView button[action=save]': {
				click : this.saveView
			},
			
		});
	},
	
	configureItem :function(record, item, esp, index) {
		console.log('configure the item')
		if (item) {
			var myName = 'ViewEditNode' + index
			var main_tabs = Ext.getCmp('main-tabs')
			if(!Ext.getCmp(myName))
			{
				//adding edit tab
				main_tabs.add({
					title: 'Edit View',
					xtype: 'ConfigView',
					id: myName,
					closable: true,}).show();
				//console.log(item.data.items)
				widgets = item.data.items;
				for (i in widgets){
					//console.log(widgets[i])
					copy = Ext.ClassManager.instantiate('canopsis.model.widget',widgets[i]);
					copy.set('leaf', true)
					//console.log(copy)
					Ext.getCmp(myName).down('GridOrdering').getStore().add(copy);
				}
				//console.log(item);
				Ext.getCmp(myName).down('#name').setValue(item.get('name'));
				Ext.getCmp(myName).down('#refreshInterval').setValue(item.get('refreshInterval'));
				Ext.getCmp(myName).down('#column').setValue(item.get('column'));
				Ext.getCmp(myName).down('#nodeId').setValue(item.get('nodeId'));
				//create preview
				this.getController('canopsis.controller.Config').createPreview();
			} else {
				console.log('tab already created');
			}
		}
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
			console.log('ViewEditor : tab already created');
		}
	},
	
	deleteButton: function() {
		var store = this.getViewGrid().getStore();
		console.log('viewEdit : delete a view');
		
		var selection = this.getViewGrid().getSelectionModel().getSelection();
		if (selection) {
			log.debug("ViewEditor : Remove record ")
			store.remove(selection);
		}
		
		//for tree
		/*
		var selectedNode = this.getTree().getSelectionModel().getSelection();
		if (selectedNode)
		{
			for (i in selectedNode){
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
				
				
				//this solve temporary the problem
				Ext.Ajax.request({
					url: '/ui/views/' + selectedNode[i].internalId,
					method: 'DELETE',
				});

			}
		}*/
		
		store.load();
		Ext.data.StoreManager.lookup('Menu').load();	
	},
	
	selectionchange: function(selections){
		this.getViewGrid().down('#deleteButton').setDisabled(selections.length === 0);
	}, 
	
	saveView : function(button){
		var view = this.getViewGrid()
		var store = view.getStore();
		var store_source = this.getGridOrder().getStore();
		
		console.log('clicked on save view');
		var name = button.up('ConfigView').down('#name');
		var column = button.up('ConfigView').down('#column');
		var refreshInterval = button.up('ConfigView').down('#refreshInterval');
		var nodeId = button.up('ConfigView').down('#nodeId')
		//console.log('the name and column');
		//console.log(name.value);
		//console.log(column.value);
		//console.log(refreshInterval.value);
		
		var record = Ext.create('canopsis.model.view');
		record.set('name', name.value);
		record.set('column', column.value);
		record.set('refreshInterval',refreshInterval.value);
		record.set('nodeId', nodeId.value);
		//record.set('leaf',true);
	
		//get all node and stock them in an object
		var temptab = [];
		
		store_source.each(function(record) {
			temptab.push(record.data);
		});	
		
		record.set('items', temptab);
		//console.log('the record');
		//console.log(record);
		if((!this.validateView(store,record, name)) || (!Ext.getCmp('ConfigView')))
		{
			//this is UNSTABLE and can ERASE all the tree (and your database)
			//store.getRootNode().appendChild(record);
			store.add(record)
			store.sync();
			store.load();
			console.log(record)
			
		/*	//this solv the problem
			Ext.Ajax.request({
				url: '/ui/views',
				params: Ext.JSON.encode(record.data),
				method: 'POST',
			});
			store.load();*/
			//reloading menu tree
			Ext.data.StoreManager.lookup('Menu').load();
			//destroy Config view and get back on viewEditor
			remove_active_tab();
			this.getViewGrid().show();
			
		} else {
			Ext.MessageBox.show({
				title: record.get('name') + 'view already exist !',
				msg: 'you can\'t add the same view twice',
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OK
			});
		}
	},
	
	validateView : function(store, record, name){
		var already_exist = false;
		//for grid
		store.findBy(
			function(record, id){
				console.log('validate name');
				console.log(record.get('name'));
				console.log(name.value);
				if(record.get('name') == name.value){
					console.log('Vieweditor : view already exist');
					already_exist = true;  // a record with this data exists
				}
			}
		);

		if (already_exist){
			Ext.MessageBox.show({
				title: data['user'] + ' already exist !',
				msg: 'you can\'t add the same user twice',
				icon: Ext.MessageBox.WARNING,
  				buttons: Ext.Msg.OK
			});
			return true
		}else{
			return false
		}	
		//for trees
	/*	if(store.getRootNode().findChild('name', record.get('name')) != null){
			already_exist = true;
		}
		return already_exist; */
	}
	
});

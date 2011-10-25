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
		console.log('viewEdit : delete a view');
		var selectedNode = Ext.getCmp('ViewEditor').getSelectionModel().getSelection();
		if (selectedNode)
		{
			console.log(selectedNode)
			var rootnode = Ext.getCmp('ViewEditor').getStore().getRootNode();
			if(rootnode.removeChild(selectedNode))
			{
				console.log('removed');
			}else{
				console.log('don\'t removed');
			}
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
		store.getRootNode().insertChild(0,record);
		store.sync();
		store.load();
	},
	
});

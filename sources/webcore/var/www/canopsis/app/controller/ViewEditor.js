Ext.define('canopsis.controller.ViewEditor', {
    extend: 'Ext.app.Controller',
    
    views: ['ViewEditor.View'],
    stores: ['ViewEditor'],
    models: ['view'],

	refs : [
	{
		ref : 'tree',
		selector: 'ViewEditor'
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
		if (this.myselection){
			console.log(this.myselection);
			var tree = Ext.getCmp('ViewEditor');
			console.log(tree)
			//var selectedNode = tree.getSelectionModel().select(node);
		}
	},
	
	selectionchange: function(selections){
		Ext.getCmp('ViewEditor').down('#deleteButton').setDisabled(selections.length === 0);
		this.myselection = selections;
	}, 
	
	saveView : function(button){
		console.log('clicked on save view');
		/*var view = button.up('ConfigView');
		//console.log(view);*/
		var name = button.up('ConfigView').down('textfield');
		/*//console.log(name);
		var tree = view.down('treeOrdering');
		var store = Ext.getCmp('ViewEditor').getStore();
		//console.log(tree)
		//mystore = Ext.getCmp('ViewEditor').getStore();
		var mystore = this.getTree().getRootNode();
		console.log(mystore);*/
		rootNode = Ext.getCmp('treeOrdering').getRootNode()
		
		//TODO : Better way to fix that
		var record = Ext.create('canopsis.model.view');
		record.set('name', name.value);
		record.set('hunit', '200');
		record.set('column', '5');
		record.set('leaf',true);
		
		var temptab = [];
		
		Ext.getCmp('treeOrdering').getRootNode().eachChild(function(node) {
			console.log(node.data);
			temptab.push(node.data);
		});	
		
		record.set('lines', temptab);
		
		console.log('the record');
		console.log(record);
		//store.getRootNode().appendChild(record);
		Ext.data.StoreManager.lookup('ViewEditor').getRootNode().insertChild(0,record);
		Ext.data.StoreManager.lookup('ViewEditor').sync();
		Ext.data.StoreManager.lookup('ViewEditor').load();
	},
	
});

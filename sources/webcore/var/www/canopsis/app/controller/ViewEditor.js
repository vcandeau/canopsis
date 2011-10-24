Ext.define('canopsis.controller.ViewEditor', {
    extend: 'Ext.app.Controller',
    
    views: ['ViewEditor.View'],
    stores: ['ViewEditor'],
    models: ['view'],

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
				selectionchange: this.selectionchange
			},
			
			//listener on the editor, because we must get option from editor
			'ConfigView #saveView': {
				click : this.addView
			}
			
		});
	},
	
	
	addView : function() {
		console.log('click on addview');
	},
	
	addButton: function() {
		console.log('viewEdit : adding a new view');
		var main_tabs = Ext.getCmp('main-tabs')
		if(!Ext.getCmp('ConfigView'))
		{
			main_tabs.add({
				title: 'New View',
				xtype: 'ConfigView',
				id: 'ConfigView',
				closable: true,}).show();
		} else {
			console.log('tab already created')
		}
	},
	
	deleteButton: function() {
		console.log('viewEdit : delete a view');
		var tree = Ext.getCmp('ViewEditor');
		var node = tree.getSelectedNode();
		console.log(node)
	},
	
	selectionchange: function(selections){
		Ext.getCmp('ViewEditor').down('#deleteButton').setDisabled(selections.length === 0);
	}, 
	
	
});

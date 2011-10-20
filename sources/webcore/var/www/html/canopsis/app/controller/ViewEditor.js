Ext.define('canopsis.controller.ViewEditor', {
    extend: 'Ext.app.Controller',
    
    views: ['ViewEditor.View'],
    stores: ['ViewEditor'],
    //models: ['Menu'],

    init: function() {
        console.log('Initialized ViewEditor');
        
        this.control({
			'ViewEditor #addButton' : {
				click: this.addButton
			},
			'ViewEditor #deleteButton' : {
				click: this.deleteButton
			},
		
		});
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
	},
	
	
	
});

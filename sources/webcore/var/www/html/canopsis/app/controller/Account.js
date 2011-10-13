Ext.define('canopsis.controller.Account', {
    extend: 'Ext.app.Controller',
    
    views: ['Account.View'],
    stores: ['Account'],
    models: ['Account'],

    init: function() {
        console.log('Initialized Account! This happens before the Application launch function is called');
        var store = Ext.create('canopsis.store.Account')
        console.log('Initialized REST store Account! ');
        this.control({
			/*'AccountView': {
				itemdblclick: this.editUser
			}*/
			'#addButton': {
				click: this.addButton
			},
			'#deleteButton': {
				click: this.deleteButton
			},
			'#saveButton': {
				click: this.saveButton
			}
			
		});
	},
	
	addButton: function(button) {
        console.log('clicked the add button');
    },
	
	deleteButton: function(button) {
		console.log('clicked the delete button');
	},
	
	saveButton: function(button) {
		console.log('clicked the save bouton');
	},
	
});

Ext.define('canopsis.controller.Account', {
    extend: 'Ext.app.Controller',
    
    views: ['Account.View','Account.Grid','Account.Form'],
    stores: ['Account'],
    models: ['Account'],

    init: function() {
        console.log('Initialized Account! This happens before the Application launch function is called');
        //var store = Ext.create('canopsis.store.Account')
        console.log('Initialized REST store Account! ');
        
        this.control({
			'AccountView': {
				selectionchange : this.selectChange
			},/*
			'#deleteButton': {
				click: this.deleteButton
			},
			'AccountGrid #saveButton': {
				click: this.saveButton
			},*/
			'AccountGrid #addButton' : {
				click: this.addButton
			},
			'AccountForm #saveForm': {
				click: this.saveForm
			},
			'AccountForm #cancelForm': {
				click: this.cancelForm
			},
			'AccountFormEdit #updateForm': {
				click: this.updateForm
			},
			'AccountGrid #deleteButton' : {
				click: this.deleteButton
			}
			
		});
	},
    
	deleteButton: function(button) {
		console.log('clicked the delete button');
		var selection = Ext.getCmp('AccountGrid').getSelectionModel().getSelection();
		log.dump(selection);
		if (selection) {
            Ext.data.StoreManager.lookup('Account').remove(selection);
        }
	},
	
	addButton: function(button) {
		console.log('clicked the add user button');
		var main_tabs = Ext.getCmp('main-tabs')
		if(!Ext.getCmp('AccountForm'))
		{
			main_tabs.add({
				title: 'New User',
				xtype: 'AccountForm',
				closable: true,}).show();
		} else {
			console.log('tab already created')
		}
	},
	
	saveForm :function(form, data) {
		console.log('clicked on the save form button');
		//get elements
		var form = Ext.getCmp('AccountForm').getForm();
		var storeform = Ext.data.StoreManager.lookup('Account');
		//log.dump(form);
		
		//check if form is valid before submit
		if (form.isValid()){
			//check if user already exist
			var already_exist = false;
			storeform.findBy(
				function(record, id){
					if(record.get('user') == form.getValues()['user']){
						  console.log('user already exist');
						  already_exist = true;  // a record with this data exists
					}
				}
			);

			//if record doesn't exist
			if (already_exist == true){
					Ext.MessageBox.show({
                        title: form.getValues()['user'] + ' already exist !',
                        msg: 'you can\'t add the same user twice',
                        icon: Ext.MessageBox.WARNING,
                        buttons: Ext.Msg.OK
                    });
			} else {
				//get values in form
				var rawfields = form.getValues();
				
				//console.log(storeform);
				//get the model and put data in
				var test = Ext.create('canopsis.model.Account',rawfields);
				//console.log(test);
				storeform.add(test);
				//storeform.sync();
				//storeform.load();
				Ext.getCmp('main-tabs').remove('AccountForm');
				//reloading the store
				storeform.load();
            }
		} else {
			console.log('form isnot valid');
		}
			
	},
	
	cancelForm : function(button) {
		console.log('clicked on cancel form button');
		Ext.getCmp('main-tabs').remove('AccountForm');
	}
	
	
	
	
	
	/*
	selectChange: function(selection){
		console.log('the item selectionned has changed');
		//Ext.ComponentQuery.query('#deleteButton').setDisabled(selections.length === 0);
	}*/
	
});

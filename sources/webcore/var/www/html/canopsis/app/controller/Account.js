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
			////////////////Action for AccountGrid
			'AccountGrid': {
				itemdblclick: this.updateRecord
			},
			'AccountGrid #addButton' : {
				click: this.addButton
			},
			'AccountGrid #deleteButton' : {
				click: this.deleteButton
			},
			/////////////Action gor AccountForm (adding form)
			'AccountForm #saveForm': {
				click: this.saveForm
			},
			'AccountForm #cancelForm': {
				click: this.cancelForm
			},
			///////////Action for AccountFormEdit (updating form)
			'AccountFormEdit #saveForm': {
				click: this.saveForm
			},
			'AccountFormEdit #cancelForm': {
				click: this.cancelForm
			},
			
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
				id: 'AccountForm',
				closable: true,}).show();
		} else {
			console.log('tab already created')
		}
	},
	
	saveForm :function() {
		console.log('clicked on the save form button');
		//get elements
		//var form = Ext.getCmp('AccountForm').getForm();
		var form = Ext.getCmp('main-tabs').getActiveTab().getForm();
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

			//if record doesn't exist and in AccountForm
			if ((already_exist == true) && (form == Ext.getCmp('AccountForm')) ){
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
				remove_active_tab();
				//reloading the store
				storeform.load();
            }
		} else {
			console.log('form isnot valid');
		}
			
	},
	
	cancelForm : function(button) {
		console.log('clicked on cancel form button');
		remove_active_tab();
	},
	
	updateRecord: function(record, item, index) {
			console.log('double click on the item');
			if (item) {
				console.log('record get');
				var main_tabs = Ext.getCmp('main-tabs')
				if(!Ext.getCmp('AccountFormEdit'))
				{
					//adding edit tab
					main_tabs.add({
						title: 'Update Account',
						xtype: 'AccountForm',
						id: 'AccountFormEdit',
						closable: true,}).show();
					Ext.getCmp('AccountFormEdit').getForm().loadRecord(item);	
				} else {
					console.log('tab already created');
				}
					
			} else {
				console.log('no record selected');
			}
		//Ext.ComponentQuery.query('#deleteButton').setDisabled(selections.length === 0);
	}
	
});

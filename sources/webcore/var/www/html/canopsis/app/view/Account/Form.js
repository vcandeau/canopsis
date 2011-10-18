Ext.define('canopsis.view.Account.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.AccountForm',
	model: 'Account',
	store : 'Account',

    requires: ['Ext.form.field.Text'],
    
    //iconCls: 'icon-user',
    frame: true,
    //id: 'AccountForm',
    title: 'Add a new user',
    defaultType: 'textfield',
    //anchor: '90%',
    //bodyPadding: '20%',
	//layout: 'fit',	
	
	items: [{
				fieldLabel: 'Login',
				name: 'user',
				allowBlank: false,
			},{
				fieldLabel: 'First Name',
				name: 'firstname',
			}, {
				fieldLabel: 'Last Name',
				name: 'lastname',
			},/*{
				fieldLabel: 'aaa access owner',
				name: 'aaa_access_owner'
			},*/{
				fieldLabel: 'E-mail',
				name: 'mail',
				vtype: 'email',
				allowBlank : true
			},/*{
				fieldLabel: 'groups',
				name: 'groups'
			},*/{
				fieldLabel: 'group',
				name: 'aaa_group'
			},{
				fieldLabel: 'password',
				name: 'passwd',
			}/*,{
				fieldLabel: 'aaa owner',
				name: 'aaa_owner'
			}*/],
            

	bbar: [{
			//iconCls: 'icon-user-add',
			text: 'Save',
			itemId: 'saveForm',
		},{
			text: 'Cancel',
			itemId: 'cancelForm',
		}
	],


    initComponent: function(){
        this.callParent();
    },
    
    beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.");
		var tab = Ext.getCmp('view.account_manager.tab');
		if (tab){
			tab.show()
		}
	}
    
});

Ext.define('canopsis.lib.view.cform', {
	extend: 'Ext.form.Panel',

	id: 'cform',

	requires: ['Ext.form.field.Text'],

	title: '',
	bodyStyle:'padding:5px 5px 0',
	border: 0,

	defaultType: 'textfield',
	
	bbar: [{
			iconCls: 'icon-save',
			text: 'Save',
			itemId: 'saveForm',
		},{
			iconCls: 'icon-cancel',
			text: 'Cancel',
			itemId: 'cancelForm',
		}
	],


    initComponent: function(){
	this.tbar =  this.bbar;
        this.callParent();
    },
    
    beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.");
		/*var tab = Ext.getCmp('view.account_manager.tab');
		if (tab){
			tab.show()
		}*/
	}
    
});

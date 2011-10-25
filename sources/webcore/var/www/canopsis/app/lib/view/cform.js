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
	this.on('beforeclose', this.beforeclose)
	this.tbar =  this.bbar;
        this.callParent();
    },
    
    beforeclose: function(tab, object){
	console.log('[view][cform] - Active previous tab');
	old_tab = Ext.getCmp('main-tabs').old_tab;
	if (old_tab) {
		Ext.getCmp('main-tabs').setActiveTab(old_tab);
	}
    },

    beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.");
	}
    
});

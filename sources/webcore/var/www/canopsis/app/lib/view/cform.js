Ext.define('canopsis.lib.view.cform', {
	extend: 'Ext.form.Panel',

	alias: 'widget.cform',

	requires: ['Ext.form.field.Text'],

	title: '',
	bodyStyle:'padding:5px 5px 0',
	border: 0,

	defaultType: 'textfield',
	
	tbar: [{
			iconCls: 'icon-save',
			text: 'Save',
			action: 'save',
		},{
			iconCls: 'icon-cancel',
			text: 'Cancel',
			action: 'cancel',
		}
	],


    initComponent: function(){
	this.on('beforeclose', this.beforeclose)
	//this.tbar =  this.bbar;
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

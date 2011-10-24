Ext.define('canopsis.view.Config.ConfigForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ConfigForm',
	model: 'Widget',
	
	
	//iconCls: 'icon-user',
    frame: true,
    //id: 'AccountForm',
    title: 'Edit properties',
    defaultType: 'textfield',
    //anchor: '90%',
    //bodyPadding: '20%',
	//layout: 'fit',	
	
	items: [{
				fieldLabel: 'title',
				name: 'title',
				allowBlank: false,
			},{
				fieldLabel: 'colspan',
				name: 'colspan',
			}, {
				fieldLabel: '_id',
				name: '_id',
			},{
				fieldLabel: 'refresh interval',
				name: 'rinterval',
			}],
            

	bbar: [{
			//iconCls: 'icon-add',
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
		var tab = Ext.getCmp('view.config_editor.tab');
		if (tab){
			tab.show()
		}
	}
    
});

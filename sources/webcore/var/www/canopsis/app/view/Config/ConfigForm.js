Ext.define('canopsis.view.Config.ConfigForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ConfigForm',
	model: 'widget',
	
	requires: ['Ext.form.field.Text'],
	
	//iconCls: 'icon-user',
    //frame: true,
    //id: 'AccountForm',
    title: 'Edit properties',
    
    bodyStyle:'padding:5px 5px 0',
	border: 0,
    
    defaultType: 'textfield',
    //anchor: '90%',
    //bodyPadding: '20%',
	//layout: 'fit',	
	
	items: [{
				fieldLabel: 'title',
				name: 'title',
				allowBlank: false,
			},{
				fieldLabel: 'length',
				name: 'colspan',
			}, {
				//xtype: 'displayfield',
				fieldLabel: '_id',
				name: '_id',
			},{
				xtype : 'button',
				text : 'Search',
				handler : function() {
					console.log('button');
					win = Ext.widget('window', {
						title: 'Live search',
						width: 500,
						height: 400,
						minHeight: 400,
						layout: 'fit',
						resizable: true,
						modal: true,
						items: [{
							xtype : 'LiveSearch'
							}],
					}).show();
				}			
			},{
				fieldLabel: 'refresh interval',
				name: 'refreshInterval',
			}],
            

	tbar: [{
			iconCls: 'icon-save',
			text: 'Save',
			//itemId: 'saveForm',
			action : 'save'
		},{
			iconCls: 'icon-cancel',
			text: 'Cancel',
			//itemId: 'cancelForm',
			action: 'cancel'
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

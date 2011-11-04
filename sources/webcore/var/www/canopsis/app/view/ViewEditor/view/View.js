Ext.define('canopsis.view.ViewEditor.view.View' ,{
	extend: 'Ext.panel.Panel',
	alias : 'widget.ConfigView',
	//model: '',
	//store : '',
	
	//id : 'ConfigView',
	
	layout: {
        type: 'table',
        columns: 3,
    },
    
    //border:false,
    
    defaults: {
		width:400, 
		height: 150,
		padding:4,
		//margin:2
		},
    
/*    defaults: {
        // applied to each contained panel
        bodyStyle: 'padding:20px'
    },*/
   
    tbar: [{
			iconCls: 'icon-save',
			text: 'Save',
			action : 'save',
		},{
			iconCls: 'icon-cancel',
			text: 'Cancel',
			action: 'cancel',
		}
	],


	items : [{
		xtype: 'form',
		//colspan : 1,
		//rowspan : 1,
		defaultType: 'textfield',
		items : [{
				fieldLabel: 'view\'s name',
				itemId: 'name',
				name: 'name',
				allowBlank: false,
			},{
				fieldLabel: 'refresh interval',
				itemId : 'refreshInterval',
				name: 'refreshInterval',
			},{
				fieldLabel: 'nb column',
				itemId: 'column',
				name: 'column',
			},{
				fieldLabel: 'nodeId',
				itemId: 'nodeId',
				name: 'nodeId',
			}]
	},{
		title : 'preview',
		xtype : 'panel',
		id : 'ConfigPreview',
		colspan : 2,
		rowspan : 2,
		height : 300,
		layout : 'fit',
	/*	items : [{
			xtype : 'ConfigPreview'
			
		}] */
	},{
		xtype : 'TreeGrid',
		//colspan : 1,
		//rowspan : 1
	},{
		xtype : 'TreeOrdering',
		colspan : 3,
		width : 800,
		height : 200,
		rowspan : 2
	}
	],
	
	initComponent: function() {
		this.callParent(arguments);
		//fix to refresh the panel at every build/rebuild
		Ext.getCmp('TreeOrdering').setRootNode(Ext.ClassManager.instantiate('Ext.data.NodeInterface'));
		Ext.getCmp('TreeOrdering').getRootNode().expand();
	},

	beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.")
	}
	

});

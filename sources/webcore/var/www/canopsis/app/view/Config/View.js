Ext.define('canopsis.view.Config.View' ,{
	extend: 'Ext.panel.Panel',
	alias : 'widget.ConfigView',
	//model: '',
	//store : '',
	
	id : 'ConfigView',
	
	layout: {
            type: 'column',
            align: 'stretch'
        },
        
    tbar: [{
		xtype: 'textfield',
		name: "view's name",
		itemId : "viewName",
		fieldLabel: "view's name",
		width: 300,
	},{
		xtype: 'tbseparator'
	},{
		text: 'Save',
		//itemId: 'saveView',
		action : 'save'
	}],
	
	
	items : [{
		xtype : 'treeGrid',
		height: '100%',
        width: '20%'
	},{
		xtype : 'treeOrdering',
		height: '100%',
        width: '80%'
	}],
	
	initComponent: function() {
		this.callParent(arguments);
		//fix to refresh the panel at every build/rebuild
		Ext.getCmp('treeOrdering').setRootNode(Ext.ClassManager.instantiate('Ext.data.NodeInterface'));
		Ext.getCmp('treeOrdering').getRootNode().expand();
	},

	beforeDestroy : function() {
		log.debug("Destroy items ...")
		canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
		log.debug(this.id + " Destroyed.")
	}

});

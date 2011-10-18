Ext.define('canopsis.view.Config.View' ,{
	extend: 'Ext.panel.Panel',
	alias : 'widget.ConfigView',
	//model: '',
	//store : '',
	
	layout: {
            type: 'column',
            align: 'stretch'
        },
        
      bbar: [{
		xtype: 'textfield',
		 name: "view's name",
		 fieldLabel: "view's name",
		 //hideLabel: true,
		 width: 300,
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
	},

	beforeDestroy : function() {
	log.debug("Destroy items ...")
	canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
        log.debug(this.id + " Destroyed.")
	}

});

Ext.define('canopsis.view.Account.View' ,{
	extend: 'Ext.panel.Panel',
	alias : 'widget.AccountView',
	model: 'Account',
	store : 'Account',
	
	layout: {
            type: 'fit',
            //align: 'stretch'
        },
	
	items : [{
		xtype : 'AccountGrid',
		//flex : 2
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

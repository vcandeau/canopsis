Ext.define('canopsis.view.Viewport', {
	extend: 'Ext.container.Viewport',

	requires: [
		'Ext.layout.container.Border',
		'Ext.tab.Panel'
	],

	layout: 'border',

	items: [
	{
		region: 'north',
		border: false,
		height: 24,
		xtype: 'Mainbar',
		//html: '<div id="div-header"><div id="title"><h1>Canopsis</h1></div><div id="logo"/></div>',
		//id: 'main-header',
	},{
		region: 'center',
		border: false,
		xtype: 'TabsView',
		id: 'main-tabs',

	},{
		region: 'west',
		border: true,
		width: 150,
		xtype: 'MenuView',
		id: 'main-menu'
	}],
	

	initComponent: function() {
		log.debug("Render viewport ...", "viewport");
		this.on('afterrender', this.afterrender, this)
		this.callParent(arguments);
	},

	afterrender: function(){
		log.debug("Viewport rendered", "viewport");
	}
		
});

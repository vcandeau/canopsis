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
		height: 65,
		html: '<div id="div-header"><div id="title"><h1>Canopsis</h1></div><div id="logo"/></div>',
		id: 'main-header'
	},
	{
		region: 'south',
		height: 40,
		html: '<div id="div-footer"></div>',
		id: 'main-footer'
	},{
		region: 'center',
		xtype: 'TabsView',
		id: 'main-tabs',

	},{
		region: 'west',
		width: 150,
		xtype: 'MenuView',
		id: 'main-menu'
	}]
});

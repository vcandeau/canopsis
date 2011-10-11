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
		border: 0,
		height: 65,
		html: '<div id="div-header"><div id="title"><h1>Canopsis</h1></div><div id="logo"/></div>',
		id: 'main-header'
	},
	{
		region: 'south',
		border: 0,
		height: 40,
		layout: {
			type: 'hbox',
			align: 'top'
		},
		// todo: re-code positionning ...
		defaults:{flex: 1, border: 0, baseCls: 'footer', padding: 3},
		items: [
			{ html: '' },
			{ html: '' },
			{ width: 130, height: '100%', flex: 0, items: Ext.createWidget('button', {
				text: 'Disconnect',
				handler: function () {
					Ext.Ajax.request({
					url: '/logout',
					scope: this,
					success: function(response){
						window.location.href='/';
					},
					failure: function ( result, request) {
						log.error("Logout impossible, maybe you're already logout")
					}
				})
			}}) },
			{ width: 130, height: '100%', flex: 0, items: Ext.createWidget('button', {
				text: 'Show log console',
				handler: function () {
					log.show_console()
				},
			}) },
			],

		id: 'main-footer'
	},{
		region: 'center',
		border: 0,
		xtype: 'TabsView',
		id: 'main-tabs',

	},{
		region: 'west',
		border: 1,
		width: 150,
		xtype: 'MenuView',
		id: 'main-menu'
	}]
});

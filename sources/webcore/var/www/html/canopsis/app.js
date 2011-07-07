Ext.onReady(function() {
	Ext.application({
		name: 'canopsis',
		appFolder: 'app',

		controllers: [
			'Menu',
			'Tabs',
			'Widgets',
			'models',
		],
	
		autoCreateViewport: true,
		launch: function() {
			Ext.get('loading').remove();
			Ext.get('loading-mask').remove();
		}

	});
});


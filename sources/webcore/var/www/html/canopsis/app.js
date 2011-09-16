Ext.onReady(function() {
	Ext.application({
		name: 'canopsis',
		appFolder: 'app',

		controllers: [
			'Menu',
			'View',
			'Tabs',
			'Widgets',
		],
	
		autoCreateViewport: true,
		launch: function() {
			log.debug('Remove mask ...')
			Ext.get('loading').remove();
			Ext.get('loading-mask').remove();
		}

	});
});


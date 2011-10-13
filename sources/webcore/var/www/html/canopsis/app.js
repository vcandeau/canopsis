Ext.onReady(function() {
	Ext.Loader.setConfig({enabled:true});

	Ext.application({
		name: 'canopsis',
		appFolder: 'app',

		controllers: [
			'Menu',
			'View',
			'Tabs',
			'Widgets',
			'Account'
		],
	
		autoCreateViewport: true,
		launch: function() {
			log.debug('Remove mask ...')
			Ext.get('loading').remove();
			Ext.get('loading-mask').remove();
		}

	});
});


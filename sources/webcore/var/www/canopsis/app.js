Ext.onReady(function() {
	Ext.Loader.setConfig({enabled:true});

	var app = Ext.application({
		name: 'canopsis',
		appFolder: 'app',

		controllers: [
			'Notify',
			'Menu',
			'View',
			'Tabs',
			'Widgets',
			'WebSocket',
			'Account',
			'Group',
			'ViewEditor'
		],
	
		autoCreateViewport: true,
		launch: function() {
			log.debug('Remove mask ...')
			Ext.get('loading').remove();
			Ext.get('loading-mask').remove();
		}

	});
});


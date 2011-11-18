Ext.onReady(function() {
	Ext.Loader.setConfig({enabled:true});

	//check Auth
	log.debug('Check auth ...', "[app]");
	Ext.Ajax.request({
		type: 'rest',
		url: '/account/me',
		reader: {
			type: 'json',
			root: 'data',
			totalProperty  : 'total',
			successProperty: 'success'
		},
		success: function(response){
			request_state = Ext.JSON.decode(response.responseText).success
			if (request_state){
				global.account = Ext.JSON.decode(response.responseText).data[0];
				createApplication()
			} else {
				window.location.href='/';
			}
		},
		failure: function() {
			window.location.href='/';
		}
	});
});


function createApplication(){
	log.debug("Start ExtJS application ...", "[app]");

	var app = Ext.application({
		name: 'canopsis',
		appFolder: 'app',

		controllers: [
			'Widgets',
			'Menu',
			'View',
			'WebSocket',
			'Notify',
			'LiveEvents',
			'Account',
			'Group',
			'ViewEditor',
			'Tabs',
		],
	
		//autoCreateViewport: true,
		launch: function() {
			this.getController('Widgets').on('loaded', this.createViewport);
		},

		createViewport: function(){
			Ext.create('canopsis.view.Viewport');
			log.debug('Remove mask ...');
			Ext.get('loading').remove();
			Ext.get('loading-mask').remove();
		}
	});

	log.debug("Application started", "[app]");
}


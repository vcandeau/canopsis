Ext.define('canopsis.controller.Mainbar', {
	extend: 'Ext.app.Controller',

	views: [ 'Mainbar.Bar'],

	logAuthor: '[controller][Mainbar]',

	init: function() {
		this.control({
			'Mainbar menuitem[action="logout"]' : {
				click : this.logout,
			},
			'Mainbar menuitem[action="cleartabscache"]' : {
				click : this.cleartabscache,
			},
			'Mainbar menuitem[action="showconsole"]' : {
				click : this.showconsole,
			}
		})

		this.callParent(arguments);
	},

	logout: function(){
		log.debug('Logout', this.logAuthor)
		Ext.Ajax.request({
			url: '/logout',
			scope: this,
			success: function(response){
				log.debug(' + Success.', this.logAuthor);
				window.location.href='/';
			},
			failure: function ( result, request) {
				log.error("Logout impossible, maybe you're already logout")
			}
		});
	},

	cleartabscache: function(){
		log.debug('Clear tabs localstore', this.logAuthor);
		var store = Ext.data.StoreManager.lookup('Tabs');
		store.proxy.clear();
	},

	showconsole: function(){
		log.debug('Show log console', this.logAuthor);
		log.show_console();
	}
});

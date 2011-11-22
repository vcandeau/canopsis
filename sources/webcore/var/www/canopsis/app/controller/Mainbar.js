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
			},
			'Mainbar [name="clock"]' : {
				afterrender : this.setClock,
			},
		})

		//Set clock
		//this.setClock();

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
	},
	
	setClock : function(item){
		log.debug('Set Clock', this.logAuthor);
		var refreshClock = function(){
			var thisTime = new Date()
			hours = thisTime.getHours();
			minutesRaw = thisTime.getMinutes();
			//add 0 if needed
			if(minutesRaw < 9){
				var minutes = "0" + minutesRaw;
			}else{
				var minutes = minutesRaw
			}
			
			item.update("<div class='cps-account' >" + hours + ":" + minutes + "  -  " + (thisTime.toLocaleDateString()) + "</div>");
		};
		Ext.TaskManager.start({
			run: refreshClock,
			interval: 1000000
		});
	}
});

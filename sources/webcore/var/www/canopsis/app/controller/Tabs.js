Ext.define('canopsis.controller.Tabs', {
	extend: 'Ext.app.Controller',

	logAuthor: '[controller][tabs]',

	stores: ['Tabs'],
	views: ['Tabs.View', 'Tabs.Content'],

	init: function() {
		this.control({
			'tabpanel': {
				tabchange: this.on_tabchange,
				add: this.on_add,
				remove: this.on_remove
			},
		});

		var store = Ext.data.StoreManager.lookup('Tabs');
		store.proxy.id = store.proxy.id + '.' + global.account.user
		store.load();
	},

  	on_tabchange: function(tabPanel, new_tab, old_tab, object){
		//log.debug('Tabchange', this.logAuthor);
		tabPanel.old_tab = old_tab
	},
  	on_add: function(component, index, object){
		log.debug('Added', this.logAuthor);	
	},

	on_remove: function(component, object){
		log.debug('Removed', this.logAuthor);
	}

});

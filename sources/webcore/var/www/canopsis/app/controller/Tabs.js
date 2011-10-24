Ext.define('canopsis.controller.Tabs', {
	extend: 'Ext.app.Controller',

	views: ['Tabs.View', 'Tabs.Content'],

	init: function() {
		this.control({
			'tabpanel': {
				tabchange: this.on_tabchange,
				//add: this.on_add,
				//remove: this.on_remove
			},
		});
	},

  	on_tabchange: function(tabPanel, new_tab, old_tab, object){
		//console.log('[controller][tabs] - tabchange');
		tabPanel.old_tab = old_tab
	},
  	on_add: function(component, index, object){
		console.log('[controller][tabs] - Added');	
	},

	on_remove: function(component, object){
		console.log('[controller][tabs] - Removed');
	}

});

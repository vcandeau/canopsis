Ext.define('canopsis.controller.Config', {
    extend: 'Ext.app.Controller',
    
    views: ['Config.View','Config.treeGrid','Config.treeOrdering'],
    //stores: ['Account'],
    //models: ['Account'],
    
    init: function() {
		console.log('Initialized Configuration editor');
	},
});

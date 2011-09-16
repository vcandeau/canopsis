Ext.define('canopsis.controller.Menu', {
    extend: 'Ext.app.Controller',

    views: ['Menu.View'],
    stores: ['Menu'],

    //itemdblclick: function(Ext.view.View this, Ext.data.Model record, HTMLElement item, Number index, Ext.EventObject e)  {
    itemclick: function(View, record, item, index, e)  {
		// Add tab in main-tab if not exist, else show it.
		if (record.data.leaf){
			var id=record.getId();
			log.debug('itemclick: '+id);
			add_view_tab(id, record.data.text)
		}
    },


    init: function() {
 	this.control({
            'MenuView': {
		'itemclick': this.itemclick,
            },
        });
    },

});

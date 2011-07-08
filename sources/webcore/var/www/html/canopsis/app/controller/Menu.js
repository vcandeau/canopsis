Ext.define('canopsis.controller.Menu', {
    extend: 'Ext.app.Controller',

    views: ['Menu.View'],
    stores: ['Menu'],

    //itemdblclick: function(Ext.view.View this, Ext.data.Model record, HTMLElement item, Number index, Ext.EventObject e)  {
    itemdblclick: function(View, record, item, index, e)  {
		// Add tab in main-tab if not exist, else show it.
		if (record.data.leaf){
			var id=record.getId();
			log.debug('itemdblclick: '+id);
			add_view_tab(id, record.data.text)
				
				/*maintabs.add(Ext.create('canopsis.view.Tabs.Content'),{title: record.data.text,
					id: id+"-tab",
					view: id,
					xtype: 'TabsContent',
					closable: true}).show();*/
		}
    },


    init: function() {
 	this.control({
            'MenuView': {
                'itemdblclick': this.itemdblclick,
            },
        });

	//this.addMenuBinding('id-view-services',this.jesuisunid);
    },

   /* addMenuBinding: function(menuid, fn) {
	log.debug('Add binding: '+menuid);
	//var MenuView[menuid]=fn;
	//var toto={ MenuView };

	this.control(menuid, fn);
	log.debug(this.control);
    }, */

});

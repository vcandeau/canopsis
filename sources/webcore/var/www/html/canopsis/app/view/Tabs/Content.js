//Ext.require([
//    'Ext.direct.*',
//]);

Ext.define('canopsis.view.Tabs.Content' ,{
    extend: 'Ext.container.Container',
    alias : 'widget.TabsContent', 
    
    style: {borderWidth:'0px'},

    layout: 'column',
    
    initComponent: function() {
		var tabId = this.id
		log.debug("Create container '"+tabId+"'")
		var me = this;

		var nb_column = this.view.get('column')
		var lines = this.view.get('lines')
		var hunit = this.view.get('hunit')

		log.debug('Create '+nb_column+' column(s)..')

		var ext_items = []
		for(var i= 0; i < lines.length; i++) {
			log.debug(' - Item '+i+':')
			var item = lines[i]

			var colspan = 1
			var rowspan = 1

			if (item['colspan']) { colspan = item['colspan'] }
			if (item['rowspan']) { rowspan = item['rowspan'] }
			
			item['height'] = rowspan * hunit

			item = {
		    	 columnWidth: colspan/nb_column,
		   	 baseCls:'x-plain',
		   	 bodyStyle: {padding: '5px'},
		   	 items:[ item ]
			}

			ext_items.push(item)

		}

		//log.dump(items)
		this.items = ext_items

		this.callParent(arguments);
    },
    
    beforeDestroy : function() {
	log.debug("Destroy items ...")
	canopsis.view.Tabs.Content.superclass.beforeDestroy.call(this);
        log.debug(this.id + " Destroyed.")
    }
});
